import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PresenterCard from "@/components/presenters/PresenterCard";
import { getPresenters } from "@/data/presenters";

export default async function PresentersSection() {
  const presenters = await getPresenters();

  return (
    <section className="border-b border-line bg-ink-2/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="02"
          eyebrow="The Voices"
          title="Meet Our Presenters"
          description="The team behind the microphone — on air every day, in the community every week."
          link={{ href: "/presenters", label: "Full Team" }}
        />

        <Reveal className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {presenters.slice(0, 4).map((p) => (
            <PresenterCard key={p.id} presenter={p} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
