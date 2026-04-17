import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';

type ModuleEmptyStateProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel?: string;
  actionHref?: string;
};

export function ModuleEmptyState({
  title,
  subtitle,
  icon,
  emptyTitle,
  emptyDescription,
  actionLabel,
  actionHref,
}: ModuleEmptyStateProps) {
  return (
    <div className="flex h-full flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-slate-500">{subtitle}</p>
      </div>

      <div className="max-w-3xl">
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
        {actionLabel && actionHref ? (
          <div className="mt-4">
            <Link href={actionHref} className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}