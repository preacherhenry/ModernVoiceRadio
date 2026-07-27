"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass, selectClass } from "@/components/admin/formStyles";
import type { Presenter } from "@prisma/client";

export type StreamInfoValues = {
  presenterId?: string;
  programName: string;
  episodeTitle?: string;
  description?: string;
  category?: string;
  tags?: string;
  coverImage?: string;
};

export default function StreamInfoForm({
  action,
  presenters,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  presenters: Presenter[];
  defaultValues?: StreamInfoValues;
  submitLabel: string;
}) {
  const [, formAction, pending] = useActionState<null, FormData>(async (_prev, formData) => {
    await action(formData);
    return null;
  }, null);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="Program Name" htmlFor="programName" full>
        <input
          id="programName"
          name="programName"
          type="text"
          required
          defaultValue={defaultValues?.programName}
          placeholder="Morning Drive"
          className={inputClass}
        />
      </FormField>
      <FormField label="Presenter" htmlFor="presenterId">
        <select
          id="presenterId"
          name="presenterId"
          defaultValue={defaultValues?.presenterId ?? ""}
          className={selectClass}
        >
          <option value="">Not linked</option>
          {presenters.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Episode Title" htmlFor="episodeTitle">
        <input
          id="episodeTitle"
          name="episodeTitle"
          type="text"
          defaultValue={defaultValues?.episodeTitle}
          placeholder="Optional"
          className={inputClass}
        />
      </FormField>
      <FormField label="Category" htmlFor="category">
        <input
          id="category"
          name="category"
          type="text"
          defaultValue={defaultValues?.category}
          placeholder="Talk, Music, News..."
          className={inputClass}
        />
      </FormField>
      <FormField label="Tags" htmlFor="tags" hint="Comma-separated">
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={defaultValues?.tags}
          placeholder="afrobeats, live, request"
          className={inputClass}
        />
      </FormField>
      <FormField label="Description" htmlFor="description" full>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          placeholder="What's today's show about?"
          className={inputClass + " resize-none"}
        />
      </FormField>
      <div className="sm:col-span-2">
        <ImageUploadField name="coverImage" label="Cover Image" defaultImage={defaultValues?.coverImage} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-2.5 bg-gold px-6 py-3 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-soft disabled:opacity-60 sm:col-span-2"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {submitLabel}
      </button>
    </form>
  );
}
