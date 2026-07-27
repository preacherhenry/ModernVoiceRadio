"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Pause, Play, Search, Siren, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/components/player/PlayerProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#listen", label: "Listen Live" },
  { href: "/shows", label: "Shows" },
  { href: "/presenters", label: "Presenters" },
  { href: "/news", label: "News" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isPlaying, togglePlay, liveBroadcast, emergency } = usePlayer();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || open
          ? "border-b border-line bg-ink/95 backdrop-blur"
          : "border-b border-transparent bg-gradient-to-b from-ink/70 to-transparent"
      )}
    >
      {emergency.active ? (
        <div className="flex items-center justify-center gap-2 bg-red px-4 py-2 text-center">
          <Siren className="size-4 shrink-0 animate-pulse-live text-white" />
          <p className="font-condensed text-xs font-bold uppercase tracking-[0.12em] text-white">
            Emergency Broadcast in Progress
            {emergency.message ? ` — ${emergency.message}` : ""}
          </p>
        </div>
      ) : (
        liveBroadcast &&
        (liveBroadcast.status === "LIVE" || liveBroadcast.status === "CONNECTING") && (
          <div className="flex items-center justify-center gap-2 bg-gold px-4 py-2 text-center">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full rounded-full bg-ink animate-pulse-live" />
              <span className="relative inline-flex size-2 rounded-full bg-ink" />
            </span>
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.12em] text-ink">
              Live Now: {liveBroadcast.programName}
              {liveBroadcast.presenterName ? ` with ${liveBroadcast.presenterName}` : ""}
            </p>
          </div>
        )
      )}
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "font-condensed text-sm font-semibold uppercase tracking-[0.1em] text-grey-300 transition-colors hover:text-white",
                pathname === link.href && "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Search"
            className="hidden size-10 items-center justify-center text-grey-300 transition-colors hover:text-white sm:flex"
          >
            <Search className="size-5" />
          </button>
          <button
            onClick={togglePlay}
            className="hidden items-center gap-2 bg-red px-5 py-2.5 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark sm:flex"
          >
            {isPlaying ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
            Listen Live
          </button>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center text-white lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>

      <div
        className={cn(
          "overflow-hidden border-t border-line bg-ink transition-[max-height] duration-300 ease-in-out lg:hidden",
          open ? "max-h-[32rem]" : "max-h-0 border-t-0"
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-line/60 py-3.5 font-condensed text-base font-semibold uppercase tracking-[0.08em] text-grey-200 last:border-none"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              togglePlay();
              setOpen(false);
            }}
            className="mt-4 flex items-center justify-center gap-2 bg-red px-5 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-white"
          >
            {isPlaying ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
            Listen Live
          </button>
        </Container>
      </div>
    </header>
  );
}
