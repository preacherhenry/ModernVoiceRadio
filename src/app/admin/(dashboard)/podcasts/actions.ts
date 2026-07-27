"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { resolveImage } from "@/lib/upload";
import { uniqueSlug } from "@/lib/slugify";

export type FormState = { error?: string };

const podcastSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  show: z.string().trim().min(1, "Podcast series name is required"),
  description: z.string().trim().min(1, "Description is required"),
  duration: z.string().trim().min(1, "Duration is required"),
  category: z.string().trim().min(1, "Category is required"),
  episode: z.coerce.number().int().min(1, "Episode number is required"),
  date: z.string().trim().min(1, "Date is required"),
});

function parsePodcastForm(formData: FormData) {
  return podcastSchema.safeParse({
    title: formData.get("title"),
    show: formData.get("show"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    category: formData.get("category"),
    episode: formData.get("episode"),
    date: formData.get("date"),
  });
}

function revalidatePodcastPages(slug?: string) {
  revalidatePath("/admin/podcasts");
  revalidatePath("/podcasts");
  revalidatePath("/");
  if (slug) revalidatePath(`/podcasts/${slug}`);
}

export async function createPodcast(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const parsed = parsePodcastForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const coverFile = formData.get("cover");
  if (!(coverFile instanceof File) || coverFile.size === 0) {
    return { error: "A cover image is required." };
  }

  let cover: string;
  try {
    cover = (await resolveImage(coverFile, "podcasts"))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(parsed.data.title, async (s) => {
    const existing = await prisma.podcast.findUnique({ where: { slug: s } });
    return !!existing;
  });

  await prisma.podcast.create({
    data: {
      slug,
      title: parsed.data.title,
      show: parsed.data.show,
      description: parsed.data.description,
      duration: parsed.data.duration,
      category: parsed.data.category,
      episode: parsed.data.episode,
      date: new Date(parsed.data.date),
      cover,
    },
  });

  revalidatePodcastPages(slug);
  redirect("/admin/podcasts");
}

export async function updatePodcast(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();

  const current = await prisma.podcast.findUnique({ where: { id } });
  if (!current) return { error: "Episode not found." };

  const parsed = parsePodcastForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const coverFile = formData.get("cover");
  let cover: string;
  try {
    cover = (await resolveImage(
      coverFile instanceof File ? coverFile : null,
      "podcasts",
      current.cover
    ))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  await prisma.podcast.update({
    where: { id },
    data: {
      title: parsed.data.title,
      show: parsed.data.show,
      description: parsed.data.description,
      duration: parsed.data.duration,
      category: parsed.data.category,
      episode: parsed.data.episode,
      date: new Date(parsed.data.date),
      cover,
    },
  });

  revalidatePodcastPages(current.slug);
  redirect("/admin/podcasts");
}

export async function deletePodcast(id: string) {
  await requireUser();
  const podcast = await prisma.podcast.delete({ where: { id } });
  revalidatePodcastPages(podcast.slug);
}
