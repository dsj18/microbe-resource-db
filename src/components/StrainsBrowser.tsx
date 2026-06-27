import Link from "next/link";
import { StrainCard } from "@/src/components/StrainCard";
import type { Strain } from "@/src/data/strains";

type StrainsBrowserProps = {
  strains: Strain[];
  query: string;
  page: number;
  pageSize: number;
  totalCount: number;
};

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  params.set("page", String(Math.max(1, page)));

  return `/strains?${params.toString()}`;
}

export function StrainsBrowser({
  strains,
  query,
  page,
  pageSize,
  totalCount,
}: StrainsBrowserProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <>
      <form action="/strains" className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="strain-search">
          搜索菌株
        </label>
        <input type="hidden" name="page" value="1" />
        <input
          id="strain-search"
          name="query"
          type="search"
          defaultValue={query}
          placeholder="搜索编号、属名、作物、来源组分、采集地点、冰箱编号、保存位置或负责人"
          className="h-12 w-full rounded-md border border-emerald-200 bg-white px-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            搜索
          </button>
          <Link
            href="/strains?page=1"
            className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            清空搜索
          </Link>
        </div>
      </form>

      <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        共 {totalCount} 条记录，当前第 {page} / {totalPages} 页，每页展示{" "}
        {pageSize} 条。
        {query ? ` 当前搜索：${query}` : ""}
      </div>

      <div className="mt-8 grid gap-5">
        {strains.map((strain, index) => (
          <StrainCard key={`${strain.code}-${index}`} strain={strain} />
        ))}
      </div>

      {strains.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          未找到匹配记录。
        </div>
      ) : null}

      <nav className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={pageHref(page - 1, query)}
          aria-disabled={!hasPrevious}
          className={`inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold transition ${
            hasPrevious
              ? "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
              : "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          上一页
        </Link>
        <div className="text-center text-sm text-slate-600">
          当前第 <span className="font-semibold text-slate-900">{page}</span>{" "}
          页 / 共{" "}
          <span className="font-semibold text-slate-900">{totalPages}</span>{" "}
          页，总记录数{" "}
          <span className="font-semibold text-slate-900">{totalCount}</span>
        </div>
        <Link
          href={pageHref(page + 1, query)}
          aria-disabled={!hasNext}
          className={`inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold transition ${
            hasNext
              ? "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
              : "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          下一页
        </Link>
      </nav>
    </>
  );
}
