import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import ArticleForm from "../../ArticleForm";
import { updateArticle } from "../../actions";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!article) notFound();

  return (
    <div>
      <AdminPageHeader eyebrow="Newsroom" title={`Edit Article`} />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <ArticleForm action={updateArticle.bind(null, article.id)} article={article} />
      </div>
    </div>
  );
}
