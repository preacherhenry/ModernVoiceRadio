import { prisma } from "@/lib/prisma";

export function getShows() {
  return prisma.show.findMany({ orderBy: { order: "asc" }, include: { host: true } });
}

export function getShowBySlug(slug: string) {
  return prisma.show.findUnique({ where: { slug }, include: { host: true } });
}
