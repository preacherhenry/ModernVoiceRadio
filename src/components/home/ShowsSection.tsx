import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ShowCard from "@/components/shows/ShowCard";
import { getShows } from "@/data/shows";

export default async function ShowsSection() {
  const shows = await getShows();

  return (
    <section className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="01"
          eyebrow="On The Schedule"
          title="Shows & Programs"
          description="From the morning commute to the weekend takeover — find the show that fits your day."
          link={{ href: "/shows", label: "Full Schedule" }}
        />

        <Reveal className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shows.slice(0, 3).map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
