import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import ShowCard from "@/components/shows/ShowCard";
import { getShows } from "@/data/shows";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Shows & Schedule | Modern Voice Radio 99.5 FM",
  description: "The full weekly schedule for Modern Voice Radio 99.5 FM.",
};

export default async function ShowsPage() {
  const shows = await getShows();

  return (
    <>
      <PageHero
        eyebrow="Weekly Schedule"
        title="Shows & Programs"
        description="From breakfast to the weekend takeover — here's what's playing, and who's behind the mic."
        image={images.showEvening}
      />
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
