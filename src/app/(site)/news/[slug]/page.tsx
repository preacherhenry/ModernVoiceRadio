import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import ArticleCard from "@/components/news/ArticleCard";
import { getArticles, getArticleBySlug } from "@/data/news";
import { formatDate } from "@/lib/format";
import { isLocalUpload } from "@/lib/image";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return {
    title: article ? `${article.title} | Modern Voice Radio` : "Story Not Found",
    description: article?.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const articles = await getArticles();
  const related = articles.filter((a) => a.id !== article.id).slice(0, 3);
  const paragraphs = article.content.split("\n\n");

  return (
    <article className="pt-20">
      <div className="relative h-[50vh] min-h-96 overflow-hidden border-b border-line bg-ink-3">
        <Image src={article.image} alt={article.title} fill priority unoptimized={isLocalUpload(article.image)} className="object-contain" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <Container className="relative flex h-full flex-col justify-end pb-12">
          <span className="w-fit bg-red px-3 py-1.5 font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white">
            {article.category}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 font-condensed text-sm uppercase tracking-[0.12em] text-grey-300">
            By {article.author} · {formatDate(article.date)}
          </p>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <Link
          href="/news"
          className="flex w-fit items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.1em] text-grey-400 hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Back to News
        </Link>

        <div className="mt-8 max-w-2xl">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="mb-6 text-lg leading-relaxed text-grey-200">
              {paragraph}
            </p>
          ))}
        </div>

        {article.images.length > 0 && (
          <div className="mt-4 max-w-4xl">
            <h2 className="font-display text-xl font-bold text-white">Photo Gallery</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {article.images.map((img) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square overflow-hidden bg-ink-3"
                >
                  <Image
                    src={img.url}
                    alt={article.title}
                    fill
                    unoptimized={isLocalUpload(img.url)}
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16 border-t border-line pt-12">
            <h2 className="font-display text-2xl font-bold text-white">More Stories</h2>
            <div className="mt-6 flex flex-col">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </article>
  );
}
