"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="you@modernvoiceradio.fm"
          className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
      </div>

      {state.error && (
        <p className="border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2.5 bg-red px-6 py-4 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-dark disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing In…
          </>
        ) : (
          <>
            <LogIn className="size-4" /> Sign In
          </>
        )}
      </button>
    </form>
  );
}
