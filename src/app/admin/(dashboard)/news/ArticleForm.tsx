"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import FormField from "@/components/admin/FormField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { inputClass, selectClass } from "@/components/admin/formStyles";
import type { FormState } from "./actions";
import { newsCategories } from "@/data/news";
import type { Article } from "@prisma/client";

const initialState: FormState = {};

export default function ArticleForm({
  action,
  article,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  article?: Article;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const dateValue = article ? article.date.toISOString().slice(0, 10) : "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ImageUploadField
        name="image"
        label="Cover Image"
        defaultImage={article?.image}
        required={!article}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Title" htmlFor="title" full>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={article?.title}
            placeholder="Chirundu Border Market Reopens..."
            className={inputClass}
          />
        </FormField>
        <FormField label="Excerpt" htmlFor="excerpt" full hint="One or two sentences shown on article cards">
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={2}
            defaultValue={article?.excerpt}
            className={inputClass + " resize-none"}
          />
        </FormField>
        <FormField
          label="Story"
          htmlFor="content"
          full
          hint="Separate paragraphs with a blank line"
        >
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={article?.content}
            className={inputClass + " resize-none"}
          />
        </FormField>
        <FormField label="Category" htmlFor="category">
          <select
            id="category"
            name="category"
            required
            defaultValue={article?.category}
            className={selectClass}
          >
            <option value="" disabled>
              Select a category
            </option>
            {newsCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Author" htmlFor="author">
          <input
            id="author"
            name="author"
            type="text"
            required
            defaultValue={article?.author}
            placeholder="Kudzai Phiri"
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
        <FormField label="Featured" htmlFor="featured">
          <label className="flex items-center gap-2.5 py-3 text-sm text-grey-300">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={article?.featured}
              className="size-4 accent-gold"
            />
            Show as the featured story on the News page
          </label>
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
        {article ? "Save Changes" : "Publish Article"}
      </button>
    </form>
  );
}
