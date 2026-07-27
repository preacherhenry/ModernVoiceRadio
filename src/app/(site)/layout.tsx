import { PlayerProvider } from "@/components/player/PlayerProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlayerBar from "@/components/player/PlayerBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Header />
      <main className="flex-1 pb-20 md:pb-24">{children}</main>
      <Footer />
      <PlayerBar />
    </PlayerProvider>
  );
}
