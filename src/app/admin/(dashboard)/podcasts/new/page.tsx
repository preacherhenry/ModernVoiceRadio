import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PodcastForm from "../PodcastForm";
import { createPodcast } from "../actions";

export default function NewPodcastPage() {
  return (
    <div>
      <AdminPageHeader eyebrow="On Demand" title="New Episode" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <PodcastForm action={createPodcast} />
      </div>
    </div>
  );
}
