import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: {
    href: string;
    label: string;
  };
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="border-b border-emerald-100 bg-white/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h1>
          {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
