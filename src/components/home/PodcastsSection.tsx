import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PodcastCard from "@/components/podcasts/PodcastCard";
import { getPodcasts } from "@/data/podcasts";

export default async function PodcastsSection() {
  const podcasts = await getPodcasts();

  return (
    <section className="border-b border-line bg-ink-2/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="04"
          eyebrow="On Demand"
          title="Podcasts"
          description="Interviews, local storytelling and the segments you missed — ready whenever you are."
          link={{ href: "/podcasts", label: "All Episodes" }}
        />

        <Reveal className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {podcasts.slice(0, 4).map((p) => (
            <PodcastCard key={p.id} podcast={p} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
