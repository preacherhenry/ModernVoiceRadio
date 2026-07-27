"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  if (submitted) {
    return (
      <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 border border-line bg-ink-2 p-9 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Send className="size-6" />
        </span>
        <h3 className="font-display text-xl font-bold text-white">Message Sent!</h3>
        <p className="max-w-xs text-sm text-grey-400">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-gold hover:text-gold-soft"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-5 border border-line bg-ink-2 p-6 sm:grid-cols-2 sm:p-9"
    >
      <Field label="Full Name" htmlFor="c-name">
        <input
          id="c-name"
          required
          type="text"
          placeholder="Your name"
          className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
      </Field>
      <Field label="Email Address" htmlFor="c-email">
        <input
          id="c-email"
          required
          type="email"
          placeholder="you@email.com"
          className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
      </Field>
      <Field label="Subject" htmlFor="c-subject" full>
        <input
          id="c-subject"
          type="text"
          placeholder="What's this about?"
          className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
      </Field>
      <Field label="Message" htmlFor="c-message" full>
        <textarea
          id="c-message"
          required
          rows={5}
          placeholder="Write your message..."
          className="w-full resize-none border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="col-span-full mt-2 flex items-center justify-center gap-2.5 bg-red px-6 py-4 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-dark disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send Message"}
        <Send className="size-4" />
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  full,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
