import type { LoginUser } from '@/types/auth';

export function SidebarUserInfo({
  user,
  collapsed = false,
}: {
  user: LoginUser | null;
  collapsed?: boolean;
}) {
  if (!user) return null;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-100">
        <span className="material-symbols-outlined text-amber-600 text-xl">person</span>
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      )}
    </div>
  );
}
