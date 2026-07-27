"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { resolveImage } from "@/lib/upload";
import { uniqueSlug } from "@/lib/slugify";

export type FormState = { error?: string };

const showSchema = z.object({
  name: z.string().trim().min(1, "Show name is required"),
  time: z.string().trim().min(1, "Time slot is required"),
  days: z.string().trim().min(1, "Days are required"),
  tag: z.string().trim().min(1, "Tag is required"),
  description: z.string().trim().min(1, "Description is required"),
  hostId: z.string().trim().optional(),
  order: z.coerce.number().int().default(0),
});

function textOrUndefined(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

function parseShowForm(formData: FormData) {
  return showSchema.safeParse({
    name: formData.get("name"),
    time: formData.get("time"),
    days: formData.get("days"),
    tag: formData.get("tag"),
    description: formData.get("description"),
    hostId: textOrUndefined(formData.get("hostId")),
    order: formData.get("order") || 0,
  });
}

function revalidateShowPages() {
  revalidatePath("/admin/shows");
  revalidatePath("/shows");
  revalidatePath("/");
}

export async function createShow(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const parsed = parseShowForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "A show image is required." };
  }

  let image: string;
  try {
    image = (await resolveImage(imageFile, "shows"))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(parsed.data.name, async (s) => {
    const existing = await prisma.show.findUnique({ where: { slug: s } });
    return !!existing;
  });

  await prisma.show.create({
    data: {
      slug,
      name: parsed.data.name,
      time: parsed.data.time,
      days: parsed.data.days,
      tag: parsed.data.tag,
      description: parsed.data.description,
      hostId: parsed.data.hostId ?? null,
      order: parsed.data.order,
      image,
    },
  });

  revalidateShowPages();
  redirect("/admin/shows");
}

export async function updateShow(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();

  const current = await prisma.show.findUnique({ where: { id } });
  if (!current) return { error: "Show not found." };

  const parsed = parseShowForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  let image: string;
  try {
    image = (await resolveImage(
      imageFile instanceof File ? imageFile : null,
      "shows",
      current.image
    ))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  await prisma.show.update({
    where: { id },
    data: {
      name: parsed.data.name,
      time: parsed.data.time,
      days: parsed.data.days,
      tag: parsed.data.tag,
      description: parsed.data.description,
      hostId: parsed.data.hostId ?? null,
      order: parsed.data.order,
      image,
    },
  });

  revalidateShowPages();
  redirect("/admin/shows");
}

export async function deleteShow(id: string) {
  await requireUser();
  await prisma.show.delete({ where: { id } });
  revalidateShowPages();
}
