'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation checks
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, username);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#22201a' }}>
      {/* Background image with overlay - removed for consistency with sign-in page */}
      
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl" style={{ 
        backgroundColor: '#2d2b26',
        border: '2px solid #3ae973'
      }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: '#fefffe' }}>Create an Account</h2>
          <p className="text-sm" style={{ color: '#fefffe' }}>Join our OJT Platform today</p>
        </div>
        
        {error && (
          <div className="p-3 rounded-md text-sm" style={{ 
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#393632',
                border: '1px solid #3ae973',
                color: '#fefffe',
                focusRing: '#3ae973'
              }}
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#393632',
                border: '1px solid #3ae973',
                color: '#fefffe',
                focusRing: '#3ae973'
              }}
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#393632',
                border: '1px solid #3ae973',
                color: '#fefffe',
                focusRing: '#3ae973'
              }}
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: '#393632',
                border: '1px solid #3ae973',
                color: '#fefffe',
                focusRing: '#3ae973'
              }}
              placeholder="••••••••"
              minLength={6}
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center" style={{ color: '#fefffe' }}>
          Already have an account?{" "}
          <Link href="/sign-in" className="hover:underline font-medium" style={{ color: '#3ae973' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}