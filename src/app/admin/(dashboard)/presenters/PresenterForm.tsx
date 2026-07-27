"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass } from "@/components/admin/formStyles";
import type { FormState } from "./actions";
import type { Presenter } from "@prisma/client";

const initialState: FormState = {};

export default function PresenterForm({
  action,
  presenter,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  presenter?: Presenter;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ImageUploadField
        name="image"
        label="Profile Photo"
        defaultImage={presenter?.image}
        required={!presenter}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="name">
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={presenter?.name}
            placeholder="Amara Nkosi"
            className={inputClass}
          />
        </FormField>
        <FormField label="AKA / Stage Name" htmlFor="aka" hint="Optional — leave blank if none">
          <input
            id="aka"
            name="aka"
            type="text"
            defaultValue={presenter?.aka ?? ""}
            placeholder="DJ Nkosi"
            className={inputClass}
          />
        </FormField>
        <FormField label="On-Air Role" htmlFor="role" full>
          <input
            id="role"
            name="role"
            type="text"
            required
            defaultValue={presenter?.role}
            placeholder="Morning Drive Host"
            className={inputClass}
          />
        </FormField>
        <FormField label="Bio" htmlFor="bio" full>
          <textarea
            id="bio"
            name="bio"
            required
            rows={4}
            defaultValue={presenter?.bio}
            placeholder="A short bio about this presenter..."
            className={inputClass + " resize-none"}
          />
        </FormField>
        <FormField label="Twitter / X URL" htmlFor="twitter">
          <input
            id="twitter"
            name="twitter"
            type="text"
            defaultValue={presenter?.twitter ?? ""}
            placeholder="https://x.com/..."
            className={inputClass}
          />
        </FormField>
        <FormField label="Instagram URL" htmlFor="instagram">
          <input
            id="instagram"
            name="instagram"
            type="text"
            defaultValue={presenter?.instagram ?? ""}
            placeholder="https://instagram.com/..."
            className={inputClass}
          />
        </FormField>
        <FormField label="Facebook URL" htmlFor="facebook">
          <input
            id="facebook"
            name="facebook"
            type="text"
            defaultValue={presenter?.facebook ?? ""}
            placeholder="https://facebook.com/..."
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
        {presenter ? "Save Changes" : "Create Presenter"}
      </button>
    </form>
  );
}
