"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { resetUserPassword } from "./actions";

export default function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
      >
        <KeyRound className="size-3.5" />
        Reset Password
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await resetUserPassword(userId, formData);
        setOpen(false);
      }}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        name="password"
        required
        minLength={8}
        placeholder="New password"
        autoFocus
        className="w-36 border border-line-strong bg-ink px-3 py-1.5 text-xs text-white placeholder:text-grey-500 focus:border-gold"
      />
      <button
        type="submit"
        className="border border-gold px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-gold"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="font-condensed text-xs uppercase tracking-[0.08em] text-grey-500 hover:text-white"
      >
        Cancel
      </button>
    </form>
  );
}
