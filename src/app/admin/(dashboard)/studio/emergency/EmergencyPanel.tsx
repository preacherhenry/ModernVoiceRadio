"use client";

import { useActionState, useState } from "react";
import { Loader2, Siren, Square } from "lucide-react";
import { startEmergencyAction, endEmergencyAction, type EmergencyFormState } from "./actions";

const initialState: EmergencyFormState = {};

export default function EmergencyPanel({ activeSessionId }: { activeSessionId: string | null }) {
  const [state, formAction, pending] = useActionState(startEmergencyAction, initialState);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  if (activeSessionId) {
    return (
      <div className="border-2 border-red bg-red/10 p-8 text-center">
        <Siren className="mx-auto size-10 animate-pulse-live text-red-bright" />
        <h2 className="mt-4 font-display text-2xl font-bold text-red-bright">
          Emergency Broadcast Active
        </h2>
        <p className="mt-2 text-sm text-grey-300">
          The emergency audio is currently live on air, interrupting normal programming.
        </p>
        <button
          disabled={ending}
          onClick={async () => {
            setEnding(true);
            await endEmergencyAction(activeSessionId);
            setEnding(false);
          }}
          className="mx-auto mt-6 flex items-center justify-center gap-2.5 border-2 border-red-bright bg-ink-2 px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.14em] text-red-bright transition-colors hover:bg-red/20 disabled:opacity-60"
        >
          {ending ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-4 fill-current" />}
          End Emergency Broadcast
        </button>
      </div>
    );
  }

  return (
    <div className="border border-line bg-ink-2 p-8">
      <div className="mx-auto max-w-md text-center">
        <Siren className="mx-auto size-10 text-grey-500" />
        <h2 className="mt-4 font-display text-xl font-bold text-white">Emergency Broadcast</h2>
        <p className="mt-2 text-sm text-grey-400">
          Administrator only. Immediately interrupts any live broadcast, plays the pre-recorded
          emergency audio to all listeners, and logs the event.
        </p>
      </div>

      <form
        action={(formData) => {
          if (!showConfirm) return;
          formAction(formData);
          setShowConfirm(false);
        }}
        className="mx-auto mt-6 flex max-w-md flex-col gap-3"
      >
        <textarea
          name="message"
          rows={3}
          placeholder="Optional message for the audit log / public banner"
          className="w-full resize-none border border-line-strong bg-ink px-4 py-3 text-sm text-white placeholder:text-grey-500 focus:border-red"
        />

        {state.error && (
          <p className="border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">{state.error}</p>
        )}

        {showConfirm ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex-1 border border-line-strong px-4 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-grey-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 bg-red px-4 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-red-dark disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Siren className="size-4" />}
              Confirm — Go Emergency
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex items-center justify-center gap-2.5 bg-red px-6 py-4 font-condensed text-base font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-dark"
          >
            <Siren className="size-5" />
            Emergency Broadcast
          </button>
        )}
      </form>
    </div>
  );
}
