import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { deleteUser } from "./actions";
import ResetPasswordForm from "./ResetPasswordForm";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  STUDIO_MANAGER: "Studio Manager",
  PRESENTER: "Presenter",
};

const roleStyles: Record<string, string> = {
  ADMIN: "border-gold text-gold",
  STUDIO_MANAGER: "border-red-bright text-red-bright",
  PRESENTER: "border-line-strong text-grey-400",
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { presenter: true },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Access"
        title="Staff Accounts"
        newHref="/admin/users/new"
        newLabel="New Account"
      />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {users.map((u) => (
          <div key={u.id} className="flex flex-col gap-3 bg-ink-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-white">{u.name}</p>
                <span
                  className={cn(
                    "border px-2.5 py-0.5 font-condensed text-[11px] font-bold uppercase tracking-[0.1em]",
                    roleStyles[u.role]
                  )}
                >
                  {roleLabels[u.role]}
                </span>
              </div>
              <p className="truncate text-xs text-grey-500">{u.email}</p>
              {u.presenter && (
                <p className="text-xs text-grey-500">Linked to presenter: {u.presenter.name}</p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <ResetPasswordForm userId={u.id} />
              <DeleteButton
                action={deleteUser.bind(null, u.id)}
                confirmText={`Remove ${u.name}'s account? They will no longer be able to sign in.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
