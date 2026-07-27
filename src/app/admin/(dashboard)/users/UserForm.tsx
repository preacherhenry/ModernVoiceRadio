"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import { inputClass, selectClass } from "@/components/admin/formStyles";
import { createStaffUser, type FormState } from "./actions";
import type { Presenter } from "@prisma/client";

const initialState: FormState = {};

export default function UserForm({ presenters }: { presenters: Presenter[] }) {
  const [state, formAction, pending] = useActionState(createStaffUser, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <FormField label="Full Name" htmlFor="name">
        <input id="name" name="name" type="text" required placeholder="Tapiwa Moyo" className={inputClass} />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tapiwa@modernvoiceradio.fm"
          className={inputClass}
        />
      </FormField>
      <FormField label="Temporary Password" htmlFor="password" hint="At least 8 characters — share this with them securely">
        <input id="password" name="password" type="text" required minLength={8} className={inputClass} />
      </FormField>
      <FormField label="Role" htmlFor="role">
        <select id="role" name="role" defaultValue="PRESENTER" className={selectClass}>
          <option value="PRESENTER">Presenter</option>
          <option value="STUDIO_MANAGER">Studio Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </FormField>
      <FormField
        label="Linked Presenter Profile"
        htmlFor="presenterId"
        full
        hint="Optional — lets this account manage its own presenter profile"
      >
        <select id="presenterId" name="presenterId" defaultValue="" className={selectClass}>
          <option value="">None</option>
          {presenters.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </FormField>

      {state.error && (
        <p className="sm:col-span-2 border border-red/40 bg-red/10 px-4 py-3 text-sm text-red-bright">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-2.5 bg-red px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-dark disabled:opacity-60 sm:col-span-2"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Create Account
      </button>
    </form>
  );
}
