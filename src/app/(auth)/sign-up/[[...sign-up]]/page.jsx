'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) router.push("/dashboard");
  }, [router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Strong password check
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;
    if (!strongPassword.test(password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userData = await signUp(email, password, username);
      localStorage.setItem("userData", JSON.stringify(userData));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#22201a]">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl border-2 border-[#3ae973] bg-[#2d2b26]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create an Account</h2>
          <p className="text-sm text-white">Join our OJT Platform today</p>
        </div>

        {error && (
          <div className="p-3 rounded-md text-sm bg-[rgba(255,107,107,0.1)] text-[#ff6b6b]">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-white">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-[#393632] border border-[#3ae973] text-white focus:outline-none focus:ring-2 focus:ring-[#3ae973] disabled:opacity-60"
              placeholder="Enter your username"
            />
          </div>

          {/* Email */}
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
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-[#393632] border border-[#3ae973] text-white focus:outline-none focus:ring-2 focus:ring-[#3ae973] disabled:opacity-60"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
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
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-[#393632] border border-[#3ae973] text-white focus:outline-none focus:ring-2 focus:ring-[#3ae973] disabled:opacity-60"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-white">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-[#393632] border border-[#3ae973] text-white focus:outline-none focus:ring-2 focus:ring-[#3ae973] disabled:opacity-60"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium bg-[#3ae973] text-black hover:bg-[#2fd166] disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center text-white">
          Already have an account?{" "}
          <Link href="/sign-in" className="hover:underline font-medium text-[#3ae973]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
