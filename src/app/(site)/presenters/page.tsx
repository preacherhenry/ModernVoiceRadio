import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import PresenterCard from "@/components/presenters/PresenterCard";
import { getPresenters } from "@/data/presenters";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Presenters | Modern Voice Radio 99.5 FM",
  description: "Meet the presenters of Modern Voice Radio 99.5 FM.",
};

export default async function PresentersPage() {
  const presenters = await getPresenters();

  return (
    <>
      <PageHero
        eyebrow="The Team"
        title="Our Presenters"
        description="The voices on air every day, and in the community every week."
        image={images.headphonesDesk}
      />
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {presenters.map((p) => (
              <PresenterCard key={p.id} presenter={p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
