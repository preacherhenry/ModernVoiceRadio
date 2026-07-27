import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import PodcastExplorer from "@/components/podcasts/PodcastExplorer";
import { getPodcasts } from "@/data/podcasts";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Podcasts | Modern Voice Radio 99.5 FM",
  description: "Interviews, local storytelling and the segments you missed.",
};

export default async function PodcastsPage() {
  const podcasts = await getPodcasts();

  return (
    <>
      <PageHero
        eyebrow="On Demand"
        title="Podcasts"
        description="Interviews, local storytelling and the segments you missed — ready whenever you are."
        image={images.headphonesDesk}
      />
      <section className="py-20 sm:py-28">
        <Container>
          <PodcastExplorer podcasts={podcasts} />
        </Container>
      </section>
    </>
  );
}
