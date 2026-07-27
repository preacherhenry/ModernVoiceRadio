import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import PodcastForm from "../../PodcastForm";
import { updatePodcast } from "../../actions";

export default async function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const podcast = await prisma.podcast.findUnique({ where: { id } });
  if (!podcast) notFound();

  return (
    <div>
      <AdminPageHeader eyebrow="On Demand" title="Edit Episode" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <PodcastForm action={updatePodcast.bind(null, podcast.id)} podcast={podcast} />
      </div>
    </div>
  );
}
