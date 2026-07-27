import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ArticleForm from "../ArticleForm";
import { createArticle } from "../actions";

export default function NewArticlePage() {
  return (
    <div>
      <AdminPageHeader eyebrow="Newsroom" title="New Article" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <ArticleForm action={createArticle} />
      </div>
    </div>
  );
}
