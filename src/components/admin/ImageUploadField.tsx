"use client";

import { useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { labelClass } from "./formStyles";

export default function ImageUploadField({
  name,
  label,
  defaultImage,
  required,
}: {
  name: string;
  label: string;
  defaultImage?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(defaultImage ?? null);

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden border border-line-strong bg-ink">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable asset
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-grey-500" />
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2 border border-line-strong px-4 py-2.5 font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-grey-300 transition-colors hover:border-gold hover:text-gold">
          <Upload className="size-4" />
          Choose Image
          <input
            type="file"
            name={name}
            accept="image/*"
            required={required && !defaultImage}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>
    </div>
  );
}
