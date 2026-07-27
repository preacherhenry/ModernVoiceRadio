import { prisma } from "@/lib/prisma";

export function getPodcasts() {
  return prisma.podcast.findMany({ orderBy: { date: "desc" } });
}

export function getPodcastBySlug(slug: string) {
  return prisma.podcast.findUnique({ where: { slug } });
}
