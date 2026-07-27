"use client";

import { useState } from "react";
import { Music4, Phone, Send } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { station } from "@/data/station";
import { submitListenerMessage } from "@/app/actions/listener-messages";

const messageTypes = [
  { value: "SONG_REQUEST", label: "Song Request" },
  { value: "SHOUTOUT", label: "Shoutout" },
  { value: "QUESTION", label: "Question" },
  { value: "FEEDBACK", label: "Feedback" },
] as const;

const messagePlaceholder: Record<(typeof messageTypes)[number]["value"], string> = {
  SONG_REQUEST: "Anything you'd like us to mention when we play it...",
  SHOUTOUT: "Shout out to...",
  QUESTION: "What would you like to ask the presenters?",
  FEEDBACK: "Tell us what you think...",
};

export default function RequestSection() {
  const [type, setType] = useState<(typeof messageTypes)[number]["value"]>("SONG_REQUEST");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitListenerMessage({}, formData);

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <section id="request" className="border-b border-line bg-ink-2/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="06"
          eyebrow="On Air With You"
          title="Request a Song or Send a Shoutout"
          description="Tell us what to play next, send a message to your favourite presenter, or shout out someone listening in."
        />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center bg-red/10 text-red">
                <Music4 className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Request Live On Air
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-grey-400">
                  Submit a request and our presenters will try to play it
                  during their next set — mention who it&apos;s for and
                  we&apos;ll read out your shoutout.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center bg-gold/10 text-gold">
                <Phone className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Prefer to Call or Message?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-grey-400">
                  Reach the studio directly on{" "}
                  <a href={`tel:${station.phone}`} className="text-white hover:text-gold">
                    {station.phone}
                  </a>{" "}
                  during any live broadcast.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-line bg-ink-2 p-6 sm:p-9">
            {submitted ? (
              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Send className="size-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-white">
                  Message Sent!
                </h3>
                <p className="max-w-xs text-sm text-grey-400">
                  Thanks — your message has landed in the studio queue. Keep
                  listening, it might be up next.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-gold hover:text-gold-soft"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="mb-2 block font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400">
                    What&apos;s this about?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {messageTypes.map((mt) => (
                      <button
                        key={mt.value}
                        type="button"
                        onClick={() => setType(mt.value)}
                        className={cn(
                          "border px-4 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
                          type === mt.value
                            ? "border-gold bg-gold text-ink"
                            : "border-line-strong text-grey-300 hover:border-gold hover:text-gold"
                        )}
                      >
                        {mt.label}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="type" value={type} />
                </div>

                <Field label="Your Name" htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    required
                    type="text"
                    placeholder="Jane Banda"
                    className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
                  />
                </Field>
                <Field label="Phone or Email" htmlFor="contact">
                  <input
                    id="contact"
                    name="contact"
                    required
                    type="text"
                    placeholder="+260 97 000 0000"
                    className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
                  />
                </Field>
                {type === "SONG_REQUEST" && (
                  <Field label="Song Request" htmlFor="song" full>
                    <input
                      id="song"
                      name="song"
                      type="text"
                      placeholder="Song title — Artist"
                      className="w-full border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
                    />
                  </Field>
                )}
                <Field label="Message" htmlFor="message" full>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder={messagePlaceholder[type]}
                    className="w-full resize-none border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-gold"
                  />
                </Field>

                {error && (
                  <p className="sm:col-span-2 border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="col-span-full mt-2 flex items-center justify-center gap-2.5 bg-red px-6 py-4 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-dark disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send Message"}
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
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
