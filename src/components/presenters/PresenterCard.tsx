import Image from "next/image";
import { FacebookIcon, InstagramIcon, XIcon } from "@/components/ui/SocialIcons";
import type { Presenter } from "@prisma/client";

export default function PresenterCard({ presenter }: { presenter: Presenter }) {
  return (
    <article className="group border border-line bg-ink-2 transition-colors hover:border-line-strong">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={presenter.image}
          alt={presenter.name}
          fill
          className="object-cover grayscale-[15%] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-transparent to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-white">
          {presenter.name}
          {presenter.aka && (
            <span className="ml-2 text-base font-normal text-grey-500">
              &ldquo;{presenter.aka}&rdquo;
            </span>
          )}
        </h3>
        <p className="font-condensed text-sm font-semibold uppercase tracking-[0.1em] text-gold">
          {presenter.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-grey-300">
          {presenter.bio}
        </p>
        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          {presenter.twitter && (
            <a
              href={presenter.twitter}
              aria-label={`${presenter.name} on Twitter`}
              className="text-grey-500 transition-colors hover:text-gold"
            >
              <XIcon className="size-4" />
            </a>
          )}
          {presenter.instagram && (
            <a
              href={presenter.instagram}
              aria-label={`${presenter.name} on Instagram`}
              className="text-grey-500 transition-colors hover:text-gold"
            >
              <InstagramIcon className="size-4" />
            </a>
          )}
          {presenter.facebook && (
            <a
              href={presenter.facebook}
              aria-label={`${presenter.name} on Facebook`}
              className="text-grey-500 transition-colors hover:text-gold"
            >
              <FacebookIcon className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
