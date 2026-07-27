import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Tag from "@/components/ui/Tag";
import FeaturedArticleCard from "@/components/news/FeaturedArticleCard";
import ArticleCard from "@/components/news/ArticleCard";
import { getArticles, newsCategories } from "@/data/news";

export default async function NewsSection() {
  const articles = await getArticles();
  if (articles.length === 0) return null;

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured.id).slice(0, 4);

  return (
    <section className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="03"
          eyebrow="The Newsroom"
          title="Latest News"
          description="Local reporting, entertainment, sport and the interviews shaping the conversation."
          link={{ href: "/news", label: "All Stories" }}
        />

        <div className="mt-8 flex flex-wrap gap-2.5">
          {newsCategories.map((c) => (
            <Tag key={c}>{c}</Tag>
          ))}
        </div>

        <Reveal className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
          <FeaturedArticleCard article={featured} />
          <div className="flex flex-col">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
