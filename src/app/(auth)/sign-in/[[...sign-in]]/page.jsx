'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, '', '/');
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { userData } = await signIn(email, password);
      
      // Check the user's role and redirect accordingly
      if (userData?.role === 'admin') {
        router.push("/admindashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#22201a' }}>
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl" style={{ backgroundColor: '#2d2b26' }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: '#fefffe' }}>Welcome to OJT Portal</h2>
          <p className="text-sm" style={{ color: '#fefffe' }}>
            Sign in to access your training dashboard
          </p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#393632',
                borderColor: '#3ae973',
                color: '#fefffe',
                focusRing: '#3ae973'
              }}
              placeholder="your.email@ojt.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#393632',
                borderColor: '#3ae973',
                color: '#fefffe',
                focusRing: '#3ae973'
              }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg transition-colors disabled:opacity-60 font-medium"
            style={{ 
              backgroundColor: '#3ae973',
              color: '#010100',
              hoverBackground: '#2fd166'
            }}
          >
            {loading ? "Signing In..." : "Log In"}
          </button>
          {error && <p className="text-sm mt-2 text-center" style={{ color: '#ff6b6b' }}>{error}</p>}
        </form>
        <div className="text-center space-y-2">
          <p className="text-sm" style={{ color: '#fefffe' }}>
            New to the OJT program?{" "}
            <a href="/sign-up" className="hover:underline font-medium" style={{ color: '#3ae973' }}>
              Register here
            </a>
          </p>
          <p className="text-sm" style={{ color: '#fefffe' }}>
            <a href="/forgot-password" className="hover:underline font-medium" style={{ color: '#3ae973' }}>
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}