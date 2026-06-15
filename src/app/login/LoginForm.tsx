"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = searchParams.get("from") || "/";
        router.replace(from);
        router.refresh();
        return;
      }

      const data = await res.json();
      setError(data.error || "Wrong password");
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-blush to-peach flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 card-shadow">
        <div className="mb-6 flex justify-center">
          <AppLogo size="lg" showName={false} />
        </div>
        <h1 className="text-center text-xl font-extrabold text-ink mb-1">
          Yaorganize
        </h1>
        <p className="text-center text-sm text-ink-light mb-6">
          Enter the password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                autoFocus
                className="field-input w-full rounded-xl border border-lavender bg-white py-2.5 pl-10 pr-4 text-ink outline-none focus:ring-2 focus:ring-violet"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-blush/50 px-3 py-2 text-sm text-ink text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-2xl bg-violet py-3 font-bold text-white transition hover:bg-violet/90 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
