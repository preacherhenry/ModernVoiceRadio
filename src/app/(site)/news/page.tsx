import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import FeaturedArticleCard from "@/components/news/FeaturedArticleCard";
import NewsExplorer from "@/components/news/NewsExplorer";
import { getArticles, newsCategories } from "@/data/news";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "News | Modern Voice Radio 99.5 FM",
  description: "Local news, entertainment, sport and interviews from Modern Voice Radio.",
};

export default async function NewsPage() {
  const articles = await getArticles();
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = featured ? articles.filter((a) => a.id !== featured.id) : [];

  return (
    <>
      <PageHero
        eyebrow="The Newsroom"
        title="Latest News"
        description="Local reporting, entertainment, sport and the interviews shaping the conversation in Chirundu."
        image={images.newsFeatured}
      />
      <section className="py-20 sm:py-28">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
          {featured ? (
            <>
              <FeaturedArticleCard article={featured} />
              <NewsExplorer articles={rest} categories={newsCategories} />
            </>
          ) : (
            <p className="text-sm text-grey-500">No stories published yet.</p>
          )}
        </Container>
      </section>
    </>
  );
}
