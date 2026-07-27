"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { resolveImage } from "@/lib/upload";
import { uniqueSlug } from "@/lib/slugify";

export type FormState = { error?: string };

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time is required"),
  location: z.string().trim().min(1, "Location is required"),
  description: z.string().trim().min(1, "Description is required"),
  ctaLabel: z.string().trim().min(1, "Button label is required"),
});

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    description: formData.get("description"),
    ctaLabel: formData.get("ctaLabel"),
  });
}

function revalidateEventPages() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "An event image is required." };
  }

  let image: string;
  try {
    image = (await resolveImage(imageFile, "events"))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(parsed.data.title, async (s) => {
    const existing = await prisma.event.findUnique({ where: { slug: s } });
    return !!existing;
  });

  await prisma.event.create({
    data: {
      slug,
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      time: parsed.data.time,
      location: parsed.data.location,
      description: parsed.data.description,
      ctaLabel: parsed.data.ctaLabel,
      image,
    },
  });

  revalidateEventPages();
  redirect("/admin/events");
}

export async function updateEvent(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();

  const current = await prisma.event.findUnique({ where: { id } });
  if (!current) return { error: "Event not found." };

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  let image: string;
  try {
    image = (await resolveImage(
      imageFile instanceof File ? imageFile : null,
      "events",
      current.image
    ))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  await prisma.event.update({
    where: { id },
    data: {
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      time: parsed.data.time,
      location: parsed.data.location,
      description: parsed.data.description,
      ctaLabel: parsed.data.ctaLabel,
      image,
    },
  });

  revalidateEventPages();
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireUser();
  await prisma.event.delete({ where: { id } });
  revalidateEventPages();
}
