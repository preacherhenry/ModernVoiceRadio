import { prisma } from "@/lib/prisma";

export function getArticles() {
  return prisma.article.findMany({ orderBy: { date: "desc" } });
}

export function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export const newsCategories = [
  "Local News",
  "Entertainment",
  "Sports",
  "Community",
  "Interviews",
] as const;
