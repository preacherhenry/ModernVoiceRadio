import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/ui/SocialIcons";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { station } from "@/data/station";

const exploreLinks = [
  { href: "/shows", label: "Shows & Programs" },
  { href: "/presenters", label: "Presenters" },
  { href: "/news", label: "Latest News" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/events", label: "Events" },
];

const stationLinks = [
  { href: "/#request", label: "Request a Song" },
  { href: "/contact", label: "Contact Us" },
  { href: "/#listen", label: "Listen Live" },
  { href: "/", label: "Home" },
];

const socials = [
  { href: station.socials.facebook, icon: FacebookIcon, label: "Facebook" },
  { href: station.socials.instagram, icon: InstagramIcon, label: "Instagram" },
  { href: station.socials.twitter, icon: XIcon, label: "Twitter / X" },
  { href: station.socials.youtube, icon: YoutubeIcon, label: "YouTube" },
  { href: station.socials.tiktok, icon: TikTokIcon, label: "TikTok" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-grey-400">
            Modern Voice Radio 99.5 FM — music, news, interviews and the
            stories of Chirundu, broadcasting every day of the week.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex size-9 items-center justify-center border border-line-strong text-grey-300 transition-colors hover:border-gold hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white">
            Explore
          </h3>
          <ul className="mt-5 flex flex-col gap-3">
            {exploreLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-grey-400 transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white">
            Station
          </h3>
          <ul className="mt-5 flex flex-col gap-3">
            {stationLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-grey-400 transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white">
            Contact
          </h3>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-grey-400">
            <li>{station.address}</li>
            <li>
              <a href={`tel:${station.phone}`} className="hover:text-gold">
                {station.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${station.email}`}
                className="hover:text-gold"
              >
                {station.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-grey-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Modern Voice Radio 99.5 FM. All
            rights reserved.
          </p>
          <p>Broadcasting live from Chirundu, every day.</p>
        </Container>
      </div>
    </footer>
  );
}
