"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 relative overflow-hidden px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-secondary/5 to-accent/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-primary/5 border border-white/60 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/25 mb-4">
              JM
            </div>
            <h1 className="text-2xl font-bold gradient-text">JobMatch Pro</h1>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Sign in to find your perfect job match
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            ) : (
              <FcGoogle className="w-5 h-5" />
            )}
            <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
          </div>

          {/* Terms notice */}
          <p className="text-center text-xs text-muted leading-relaxed">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>

          {/* New user CTA */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <FiLogIn className="w-4 h-4" />
              <span>
                New here?{" "}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="text-primary font-medium hover:text-primary-dark transition-colors"
                >
                  Start your free trial
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="text-center text-xs text-muted/60 mt-6">
          AI-powered job matching across 7+ sources
        </p>
      </div>
    </div>
  );
}
