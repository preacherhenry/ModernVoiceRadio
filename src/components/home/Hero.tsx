import Image from "next/image";
import { Mic2 } from "lucide-react";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import HeroPlayerCard from "@/components/player/HeroPlayerCard";
import ListenLiveButton from "@/components/player/ListenLiveButton";
import { images } from "@/data/images";
import { station } from "@/data/station";

export default function Hero() {
  return (
    <section
      id="listen"
      className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-line pt-20"
    >
      <Image
        src={images.heroStudio}
        alt="Modern Voice Radio studio"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      <Container className="relative grid grid-cols-1 items-end gap-14 py-16 lg:grid-cols-[1.35fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 border border-line-strong px-4 py-2 w-fit">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-red animate-pulse-live" />
              <span className="relative inline-flex size-2 rounded-full bg-red" />
            </span>
            <span className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white">
              Broadcasting Live From Chirundu
            </span>
          </div>

          <h1 className="mt-7 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            MODERN VOICE
            <br />
            RADIO
            <span className="ml-4 text-gold">{station.frequency}</span>
          </h1>

          <p className="mt-6 max-w-lg font-condensed text-xl font-semibold uppercase tracking-[0.1em] text-grey-200 sm:text-2xl">
            &ldquo;{station.slogan}&rdquo;
          </p>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-grey-300">
            Music, news and the voices of your community — every hour, every
            day. This is where Chirundu tunes in.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ListenLiveButton />
            <Button variant="outline" href="/shows" icon={<Mic2 className="size-4" />}>
              View Schedule
            </Button>
            <Button variant="ghost" href="/#request">
              Request a Song →
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPlayerCard />
        </div>
      </Container>
    </section>
  );
}
