'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect only if authenticated in Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          router.push(parsed.role === "admin" ? "/admindashboard" : "/dashboard");
        }
      } else {
        // If no auth session, clear any stale data
        localStorage.removeItem("userData");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { userData } = await signIn(email, password);

      if (!userData?.role) {
        throw new Error("User role is missing.");
      }

      localStorage.setItem("userData", JSON.stringify(userData));

      router.push(userData.role === "admin" ? "/admindashboard" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#22201a]">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl bg-[#2d2b26]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome to OJT Portal</h2>
          <p className="text-sm text-white">Sign in to access your training dashboard</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-[#393632] border-[#3ae973] text-white focus:outline-none focus:ring-2 focus:ring-[#3ae973]"
              placeholder="your.email@ojt.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-[#393632] border-[#3ae973] text-white focus:outline-none focus:ring-2 focus:ring-[#3ae973]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium bg-[#3ae973] text-black hover:bg-[#2fd166] disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing In..." : "Log In"}
          </button>

          {error && (
            <p className="text-sm mt-2 text-center text-[#ff6b6b]">{error}</p>
          )}
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-white">
            New to the OJT program?{" "}
            <a href="/sign-up" className="hover:underline font-medium text-[#3ae973]">
              Register here
            </a>
          </p>
          <p className="text-sm text-white">
            <a href="/forgot-password" className="hover:underline font-medium text-[#3ae973]">
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
