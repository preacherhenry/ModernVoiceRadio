import { prisma } from "@/lib/prisma";

export function getEvents() {
  return prisma.event.findMany({ orderBy: { date: "asc" } });
}

export function getEventBySlug(slug: string) {
  return prisma.event.findUnique({ where: { slug } });
}
