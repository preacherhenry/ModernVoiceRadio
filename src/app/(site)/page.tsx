import Hero from "@/components/home/Hero";
import StatsBand from "@/components/home/StatsBand";
import ShowsSection from "@/components/home/ShowsSection";
import PresentersSection from "@/components/home/PresentersSection";
import NewsSection from "@/components/home/NewsSection";
import PodcastsSection from "@/components/home/PodcastsSection";
import EventsSection from "@/components/home/EventsSection";
import RequestSection from "@/components/home/RequestSection";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBand />
      <ShowsSection />
      <PresentersSection />
      <NewsSection />
      <PodcastsSection />
      <EventsSection />
      <RequestSection />
    </>
  );
}
