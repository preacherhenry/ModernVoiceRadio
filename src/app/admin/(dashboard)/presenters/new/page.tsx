import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PresenterForm from "../PresenterForm";
import { createPresenter } from "../actions";

export default function NewPresenterPage() {
  return (
    <div>
      <AdminPageHeader eyebrow="Team" title="New Presenter" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <PresenterForm action={createPresenter} />
      </div>
    </div>
  );
}
