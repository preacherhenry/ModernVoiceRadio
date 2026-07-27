import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/contact/ContactForm";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/ui/SocialIcons";
import { station } from "@/data/station";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Contact | Modern Voice Radio 99.5 FM",
  description: "Get in touch with Modern Voice Radio 99.5 FM.",
};

const socials = [
  { href: station.socials.facebook, icon: FacebookIcon, label: "Facebook" },
  { href: station.socials.instagram, icon: InstagramIcon, label: "Instagram" },
  { href: station.socials.twitter, icon: XIcon, label: "Twitter / X" },
  { href: station.socials.youtube, icon: YoutubeIcon, label: "YouTube" },
  { href: station.socials.tiktok, icon: TikTokIcon, label: "TikTok" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title="Contact Us"
        description="Reach the studio, connect with a presenter, or drop by — we'd love to hear from you."
        image={images.cityNight}
      />

      <section className="py-20 sm:py-28">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center bg-red/10 text-red">
                <MapPin className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Studio Address</h3>
                <p className="mt-1 text-sm leading-relaxed text-grey-400">
                  {station.address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center bg-gold/10 text-gold">
                <Phone className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Phone</h3>
                <a
                  href={`tel:${station.phone}`}
                  className="mt-1 block text-sm text-grey-400 hover:text-gold"
                >
                  {station.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center bg-red/10 text-red">
                <Mail className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Email</h3>
                <a
                  href={`mailto:${station.email}`}
                  className="mt-1 block text-sm text-grey-400 hover:text-gold"
                >
                  {station.email}
                </a>
              </div>
            </div>

            <div className="border-t border-line pt-6">
              <h3 className="font-display text-lg font-bold text-white">Follow The Station</h3>
              <div className="mt-4 flex items-center gap-3">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex size-10 items-center justify-center border border-line-strong text-grey-300 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="relative h-64 overflow-hidden border border-line">
              <iframe
                src={station.mapEmbedSrc}
                title="Modern Voice Radio studio location"
                className="absolute inset-0 size-full grayscale-[40%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <ContactForm />
        </Container>
      </section>
    </>
  );
}
