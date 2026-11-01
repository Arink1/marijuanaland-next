"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login, type ActionState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    login,
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-beige bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/Marijuana-Land-Badge2.gif"
            alt="Marijuana Land"
            width={96}
            height={96}
            className="h-24 w-24"
            unoptimized
          />
        </div>
        <h1 className="text-center text-xl font-bold uppercase tracking-brand text-olive">
          Owner Login
        </h1>
        <p className="mt-2 text-center text-sm text-stone-warm">
          Sign in to manage site content.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-semibold"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="w-full rounded border border-beige px-3 py-2 outline-none focus:border-gold"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="rounded border border-orange/40 bg-orange/10 px-3 py-2 text-sm text-orange-dark"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-orange py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
