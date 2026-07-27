import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EventForm from "../EventForm";
import { createEvent } from "../actions";

export default function NewEventPage() {
  return (
    <div>
      <AdminPageHeader eyebrow="Save The Date" title="New Event" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <EventForm action={createEvent} />
      </div>
    </div>
  );
}
