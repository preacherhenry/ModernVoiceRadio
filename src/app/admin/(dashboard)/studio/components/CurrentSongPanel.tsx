"use client";

import { useActionState, useEffect, useState } from "react";
import { Music4, Send } from "lucide-react";
import { inputClass } from "@/components/admin/formStyles";
import { setNowPlayingAction, type StudioFormState } from "../actions";

type NowPlaying = { song: string | null; artist: string | null; source: "auto" | "manual" | null };

const initialState: StudioFormState = {};

export default function CurrentSongPanel() {
  const [nowPlaying, setNowPlayingState] = useState<NowPlaying>({ song: null, artist: null, source: null });
  const [, formAction, pending] = useActionState(setNowPlayingAction, initialState);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.title) {
          setNowPlayingState({ song: data.title, artist: data.artist, source: "auto" });
        }
      } catch {
        // ignore transient failures
      }
    }

    poll();
    const id = setInterval(poll, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="border border-line bg-ink-2 p-5">
      <div className="flex items-center gap-2 text-grey-400">
        <Music4 className="size-4" />
        <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em]">Current Song</p>
      </div>

      {nowPlaying.song ? (
        <div className="mt-3">
          <p className="text-lg font-bold text-white">{nowPlaying.song}</p>
          {nowPlaying.artist && <p className="text-sm text-grey-400">{nowPlaying.artist}</p>}
          <p className="mt-1 font-condensed text-[11px] uppercase tracking-[0.1em] text-grey-600">
            {nowPlaying.source === "auto" ? "Auto-detected from stream metadata" : "Manually set"}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-grey-500">
          No automation metadata detected. Set it manually below when playing music through a mixer or
          turntable.
        </p>
      )}

      <form
        action={async (formData) => {
          await formAction(formData);
          setNowPlayingState({
            song: String(formData.get("song") || "") || null,
            artist: String(formData.get("artist") || "") || null,
            source: "manual",
          });
        }}
        className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row"
      >
        <input name="song" type="text" placeholder="Song title" className={inputClass} />
        <input name="artist" type="text" placeholder="Artist" className={inputClass} />
        <button
          type="submit"
          disabled={pending}
          className="flex shrink-0 items-center justify-center gap-2 bg-ink-4 px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-ink-3 disabled:opacity-60"
        >
          <Send className="size-3.5" />
          Set
        </button>
      </form>
    </div>
  );
}
