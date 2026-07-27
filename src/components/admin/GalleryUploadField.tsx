"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Undo2, X } from "lucide-react";
import { labelClass } from "./formStyles";

export default function GalleryUploadField({
  name,
  label,
  existingImages,
}: {
  name: string;
  label: string;
  existingImages?: { id: string; url: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([]);

  // A native <input type="file"> replaces its FileList on every picker
  // invocation rather than appending to it, so we maintain the running set
  // ourselves and resync the input's .files (via DataTransfer) after every
  // add/remove - that's what actually gets submitted with the form.
  function syncInputFiles(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function toggleRemoveExisting(id: string) {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const added = Array.from(fileList).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setNewPreviews((prev) => {
      const next = [...prev, ...added];
      syncInputFiles(next.map((p) => p.file));
      return next;
    });
  }

  function removeNewPreview(index: number) {
    setNewPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      syncInputFiles(next.map((p) => p.file));
      return next;
    });
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <p className="mb-3 text-xs text-grey-500">Optional. Add as many extra photos as you like.</p>

      {existingImages && existingImages.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingImages.map((img) => {
            const marked = removedIds.has(img.id);
            return (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden border border-line-strong bg-ink"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local upload, not an optimizable asset */}
                <img
                  src={img.url}
                  alt=""
                  className={"size-full object-cover" + (marked ? " opacity-30" : "")}
                />
                {marked && <input type="hidden" name="removeImageIds" value={img.id} />}
                <button
                  type="button"
                  onClick={() => toggleRemoveExisting(img.id)}
                  className={
                    "absolute right-1 top-1 flex size-6 items-center justify-center text-white " +
                    (marked ? "bg-gold" : "bg-black/60 hover:bg-red")
                  }
                  aria-label={marked ? "Keep this image" : "Remove this image"}
                >
                  {marked ? <Undo2 className="size-3.5" /> : <Trash2 className="size-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {newPreviews.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {newPreviews.map((p, i) => (
            <div key={p.url} className="relative aspect-square overflow-hidden border border-line-strong bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable asset */}
              <img src={p.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewPreview(i)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center bg-black/60 text-white hover:bg-red"
                aria-label="Remove this image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-2 border border-line-strong px-4 py-2.5 font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-grey-300 transition-colors hover:border-gold hover:text-gold">
        <ImagePlus className="size-4" />
        Add Photos
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      </label>
    </div>
  );
}
