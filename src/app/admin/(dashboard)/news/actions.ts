"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { resolveImage, saveUploadedImage } from "@/lib/upload";
import { uniqueSlug } from "@/lib/slugify";
import { newsCategories } from "@/data/news";

export type FormState = { error?: string };

const articleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  content: z.string().trim().min(1, "Story content is required"),
  category: z.enum(newsCategories),
  date: z.string().trim().min(1, "Date is required"),
  author: z.string().trim().min(1, "Author is required"),
  featured: z.coerce.boolean().default(false),
});

function parseArticleForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    date: formData.get("date"),
    author: formData.get("author"),
    featured: formData.get("featured") === "on",
  });
}

function revalidateNewsPages(slug?: string) {
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  if (slug) revalidatePath(`/news/${slug}`);
}

async function saveGalleryImages(formData: FormData): Promise<string[]> {
  const files = formData.getAll("galleryImages").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await saveUploadedImage(file, "news"));
  }
  return urls;
}

export async function createArticle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const parsed = parseArticleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "A cover image is required." };
  }

  let image: string;
  let galleryUrls: string[];
  try {
    image = (await resolveImage(imageFile, "news"))!;
    galleryUrls = await saveGalleryImages(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(parsed.data.title, async (s) => {
    const existing = await prisma.article.findUnique({ where: { slug: s } });
    return !!existing;
  });

  await prisma.article.create({
    data: {
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      category: parsed.data.category,
      date: new Date(parsed.data.date),
      author: parsed.data.author,
      featured: parsed.data.featured,
      image,
      images: {
        create: galleryUrls.map((url, order) => ({ url, order })),
      },
    },
  });

  revalidateNewsPages(slug);
  redirect("/admin/news");
}

export async function updateArticle(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireUser();

  const current = await prisma.article.findUnique({ where: { id }, include: { images: true } });
  if (!current) return { error: "Article not found." };

  const parsed = parseArticleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const imageFile = formData.get("image");
  let image: string;
  let newGalleryUrls: string[];
  try {
    image = (await resolveImage(
      imageFile instanceof File ? imageFile : null,
      "news",
      current.image
    ))!;
    newGalleryUrls = await saveGalleryImages(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const removeImageIds = formData.getAll("removeImageIds").filter((v): v is string => typeof v === "string" && v.length > 0);
  const startOrder = current.images.length;

  await prisma.article.update({
    where: { id },
    data: {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      category: parsed.data.category,
      date: new Date(parsed.data.date),
      author: parsed.data.author,
      featured: parsed.data.featured,
      image,
      images: {
        ...(removeImageIds.length > 0 ? { deleteMany: { id: { in: removeImageIds } } } : {}),
        create: newGalleryUrls.map((url, i) => ({ url, order: startOrder + i })),
      },
    },
  });

  revalidateNewsPages(current.slug);
  redirect("/admin/news");
}

export async function deleteArticle(id: string) {
  await requireUser();
  const article = await prisma.article.delete({ where: { id } });
  revalidateNewsPages(article.slug);
}
