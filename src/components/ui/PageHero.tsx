import Image from "next/image";
import Container from "@/components/ui/Container";

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
}) {
  return (
    <section className="relative flex min-h-[46vh] items-end overflow-hidden border-b border-line pt-20">
      <Image src={image} alt="" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/50" />
      <Container className="relative py-14">
        <span className="font-condensed text-sm font-bold uppercase tracking-[0.22em] text-gold">
          {eyebrow}
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-grey-300">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
