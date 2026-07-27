"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass } from "@/components/admin/formStyles";
import type { FormState } from "./actions";
import type { Podcast } from "@prisma/client";

const initialState: FormState = {};

export default function PodcastForm({
  action,
  podcast,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  podcast?: Podcast;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const dateValue = podcast ? podcast.date.toISOString().slice(0, 10) : "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ImageUploadField
        name="cover"
        label="Cover Art"
        defaultImage={podcast?.cover}
        required={!podcast}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Episode Title" htmlFor="title" full>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={podcast?.title}
            placeholder="In the Studio With Sable Ridge"
            className={inputClass}
          />
        </FormField>
        <FormField label="Podcast Series" htmlFor="show">
          <input
            id="show"
            name="show"
            type="text"
            required
            defaultValue={podcast?.show}
            placeholder="Modern Voice Sessions"
            className={inputClass}
          />
        </FormField>
        <FormField label="Category" htmlFor="category">
          <input
            id="category"
            name="category"
            type="text"
            required
            defaultValue={podcast?.category}
            placeholder="Interviews"
            className={inputClass}
          />
        </FormField>
        <FormField label="Episode Number" htmlFor="episode">
          <input
            id="episode"
            name="episode"
            type="number"
            min={1}
            required
            defaultValue={podcast?.episode}
            className={inputClass}
          />
        </FormField>
        <FormField label="Duration" htmlFor="duration" hint="e.g. 42 min">
          <input
            id="duration"
            name="duration"
            type="text"
            required
            defaultValue={podcast?.duration}
            placeholder="42 min"
            className={inputClass}
          />
        </FormField>
        <FormField label="Publish Date" htmlFor="date">
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={dateValue}
            className={inputClass}
          />
        </FormField>
        <FormField label="Description" htmlFor="description" full>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={podcast?.description}
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
        {podcast ? "Save Changes" : "Publish Episode"}
      </button>
    </form>
  );
}
