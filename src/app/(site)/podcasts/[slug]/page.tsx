import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import Tag from "@/components/ui/Tag";
import PodcastCard from "@/components/podcasts/PodcastCard";
import PodcastPlayerPreview from "@/components/podcasts/PodcastPlayerPreview";
import { getPodcasts, getPodcastBySlug } from "@/data/podcasts";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const podcasts = await getPodcasts();
  return podcasts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  return {
    title: podcast ? `${podcast.title} | Modern Voice Radio` : "Episode Not Found",
    description: podcast?.description,
  };
}

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();

  const podcasts = await getPodcasts();
  const more = podcasts.filter((p) => p.id !== podcast.id).slice(0, 4);

  return (
    <div className="pt-20">
      <Container className="py-14 sm:py-20">
        <Link
          href="/podcasts"
          className="flex w-fit items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.1em] text-grey-400 hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Back to Podcasts
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[380px_1fr]">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image src={podcast.cover} alt={podcast.title} fill className="object-cover" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Tag className="border-gold text-gold">{podcast.show}</Tag>
              <Tag>Episode {podcast.episode}</Tag>
              <Tag>{podcast.category}</Tag>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {podcast.title}
            </h1>
            <p className="mt-2 font-condensed text-sm uppercase tracking-[0.1em] text-grey-500">
              {formatDate(podcast.date)} · {podcast.duration}
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-grey-300">
              {podcast.description}
            </p>

            <div className="mt-8">
              <PodcastPlayerPreview duration={podcast.duration} />
            </div>
          </div>
        </div>

        {more.length > 0 && (
          <div className="mt-20 border-t border-line pt-12">
            <h2 className="font-display text-2xl font-bold text-white">
              More From {podcast.show}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {more.map((p) => (
                <PodcastCard key={p.id} podcast={p} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
