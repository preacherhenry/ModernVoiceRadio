"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass } from "@/components/admin/formStyles";
import type { FormState } from "./actions";
import type { Event } from "@prisma/client";

const initialState: FormState = {};

export default function EventForm({
  action,
  event,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  event?: Event;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const dateValue = event ? event.date.toISOString().slice(0, 10) : "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ImageUploadField name="image" label="Event Image" defaultImage={event?.image} required={!event} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Event Title" htmlFor="title" full>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={event?.title}
            placeholder="Modern Voice Block Party"
            className={inputClass}
          />
        </FormField>
        <FormField label="Date" htmlFor="date">
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={dateValue}
            className={inputClass}
          />
        </FormField>
        <FormField label="Time" htmlFor="time">
          <input
            id="time"
            name="time"
            type="text"
            required
            defaultValue={event?.time}
            placeholder="2:00 PM — 10:00 PM"
            className={inputClass}
          />
        </FormField>
        <FormField label="Location" htmlFor="location" full>
          <input
            id="location"
            name="location"
            type="text"
            required
            defaultValue={event?.location}
            placeholder="Riverside Grounds, Chirundu"
            className={inputClass}
          />
        </FormField>
        <FormField label="Description" htmlFor="description" full>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={event?.description}
            className={inputClass + " resize-none"}
          />
        </FormField>
        <FormField label="Button Label" htmlFor="ctaLabel" hint="e.g. Get Tickets, RSVP">
          <input
            id="ctaLabel"
            name="ctaLabel"
            type="text"
            required
            defaultValue={event?.ctaLabel}
            placeholder="Get Tickets"
            className={inputClass}
          />
        </FormField>
      </div>

      {state.error && (
        <p className="border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-2.5 bg-red px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-dark disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {event ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}
