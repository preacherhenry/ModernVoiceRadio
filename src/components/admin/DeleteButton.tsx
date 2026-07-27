"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Delete this item? This cannot be undone.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-red hover:text-red"
      >
        <Trash2 className="size-3.5" />
        {label}
      </button>
    </form>
  );
}
