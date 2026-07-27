"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { resolveImage } from "@/lib/upload";
import { uniqueSlug } from "@/lib/slugify";

export type FormState = { error?: string };

const presenterSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  aka: z.string().trim().optional(),
  role: z.string().trim().min(1, "On-air role is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  twitter: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
});

function textOrUndefined(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

function parsePresenterForm(formData: FormData) {
  return presenterSchema.safeParse({
    name: formData.get("name"),
    aka: textOrUndefined(formData.get("aka")),
    role: formData.get("role"),
    bio: formData.get("bio"),
    twitter: textOrUndefined(formData.get("twitter")),
    instagram: textOrUndefined(formData.get("instagram")),
    facebook: textOrUndefined(formData.get("facebook")),
  });
}

function revalidatePresenterPages() {
  revalidatePath("/admin/presenters");
  revalidatePath("/presenters");
  revalidatePath("/shows");
  revalidatePath("/");
}

export async function createPresenter(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const parsed = parsePresenterForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "A profile photo is required." };
  }

  let image: string;
  try {
    image = (await resolveImage(imageFile, "presenters"))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(parsed.data.name, async (s) => {
    const existing = await prisma.presenter.findUnique({ where: { slug: s } });
    return !!existing;
  });

  await prisma.presenter.create({
    data: {
      name: parsed.data.name,
      aka: parsed.data.aka ?? null,
      role: parsed.data.role,
      bio: parsed.data.bio,
      twitter: parsed.data.twitter ?? null,
      instagram: parsed.data.instagram ?? null,
      facebook: parsed.data.facebook ?? null,
      slug,
      image,
    },
  });

  revalidatePresenterPages();
  redirect("/admin/presenters");
}

export async function updatePresenter(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();

  const current = await prisma.presenter.findUnique({ where: { id } });
  if (!current) return { error: "Presenter not found." };

  const parsed = parsePresenterForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  let image: string;
  try {
    image = (await resolveImage(
      imageFile instanceof File ? imageFile : null,
      "presenters",
      current.image
    ))!;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  await prisma.presenter.update({
    where: { id },
    data: {
      name: parsed.data.name,
      aka: parsed.data.aka ?? null,
      role: parsed.data.role,
      bio: parsed.data.bio,
      twitter: parsed.data.twitter ?? null,
      instagram: parsed.data.instagram ?? null,
      facebook: parsed.data.facebook ?? null,
      image,
    },
  });

  revalidatePresenterPages();
  redirect("/admin/presenters");
}

export async function deletePresenter(id: string) {
  await requireUser();
  await prisma.presenter.delete({ where: { id } });
  revalidatePresenterPages();
}
