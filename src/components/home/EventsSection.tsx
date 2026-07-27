import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import EventCard from "@/components/events/EventCard";
import { getEvents } from "@/data/events";

export default async function EventsSection() {
  const events = await getEvents();

  return (
    <section className="border-b border-line py-20 sm:py-28">
      <Container>
        <SectionHeading
          index="05"
          eyebrow="Save The Date"
          title="Upcoming Events"
          description="Live broadcasts, community gatherings and station takeovers happening on the ground."
          link={{ href: "/events", label: "All Events" }}
        />

        <Reveal className="mt-12 flex flex-col gap-6">
          {events.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
