import { prisma } from "@/lib/prisma";

export function getPresenters() {
  return prisma.presenter.findMany({ orderBy: { createdAt: "desc" } });
}

export function getPresenterBySlug(slug: string) {
  return prisma.presenter.findUnique({ where: { slug } });
}
