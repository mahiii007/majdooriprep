"use client";

import { signIn } from "next-auth/react";
import { Github, Terminal } from "lucide-react";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <div className="mb-1 flex items-center gap-2 text-accent">
            <Terminal size={22} />
          </div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-white">
            Majdoori<span className="text-accent">Prep</span>
          </h1>
          <p className="label-mono">Deep Work Mode</p>
        </div>

        <div className="panel p-6">
          <p className="mb-6 text-center text-sm text-neutral-400">
            Sign in to track your progress, streaks, and daily practice set.
          </p>

          <div className="flex flex-col gap-3">
            <button
              className="focus-ring flex items-center justify-center gap-3 rounded-md border border-base-600 bg-white px-4 py-2.5 text-sm font-medium text-base-950 transition-opacity hover:opacity-90"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <GoogleMark />
              Continue with Google
            </button>
            <button
              className="focus-ring flex items-center justify-center gap-3 rounded-md border border-base-600 bg-base-800 px-4 py-2.5 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-400"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <Github size={18} />
              Continue with GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Consistent labor is the path to technical mastery.
        </p>
      </div>
    </main>
  );
}
