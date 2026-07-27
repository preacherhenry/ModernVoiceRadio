"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass, selectClass } from "@/components/admin/formStyles";
import type { FormState } from "./actions";
import type { Presenter, Show } from "@prisma/client";

const initialState: FormState = {};

export default function ShowForm({
  action,
  show,
  presenters,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  show?: Show;
  presenters: Presenter[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ImageUploadField name="image" label="Show Image" defaultImage={show?.image} required={!show} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Show Name" htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={show?.name}
            placeholder="Morning Drive"
            className={inputClass}
          />
        </FormField>
        <FormField label="Tag" htmlFor="tag" hint="Short label shown on the card, e.g. Breakfast">
          <input
            id="tag"
            name="tag"
            type="text"
            required
            defaultValue={show?.tag}
            placeholder="Breakfast"
            className={inputClass}
          />
        </FormField>
        <FormField label="Time Slot" htmlFor="time">
          <input
            id="time"
            name="time"
            type="text"
            required
            defaultValue={show?.time}
            placeholder="6:00 AM — 10:00 AM"
            className={inputClass}
          />
        </FormField>
        <FormField label="Days" htmlFor="days">
          <input
            id="days"
            name="days"
            type="text"
            required
            defaultValue={show?.days}
            placeholder="Monday — Friday"
            className={inputClass}
          />
        </FormField>
        <FormField label="Host" htmlFor="hostId">
          <select
            id="hostId"
            name="hostId"
            defaultValue={show?.hostId ?? ""}
            className={selectClass}
          >
            <option value="">No host assigned</option>
            {presenters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Sort Order" htmlFor="order" hint="Lower numbers appear first">
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={show?.order ?? 0}
            className={inputClass}
          />
        </FormField>
        <FormField label="Description" htmlFor="description" full>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={show?.description}
            placeholder="What's this show about..."
            className={inputClass + " resize-none"}
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
        {show ? "Save Changes" : "Create Show"}
      </button>
    </form>
  );
}
