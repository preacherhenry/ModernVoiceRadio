import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import EventCard from "@/components/events/EventCard";
import { getEvents } from "@/data/events";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Events | Modern Voice Radio 99.5 FM",
  description: "Upcoming live broadcasts and community events from Modern Voice Radio.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHero
        eyebrow="Save The Date"
        title="Upcoming Events"
        description="Live broadcasts, community gatherings and station takeovers happening on the ground."
        image={images.eventCrowd}
      />
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-6">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
