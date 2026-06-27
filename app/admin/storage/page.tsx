import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import {
  getStoragePage,
  getStorageSummary,
} from "@/src/lib/supabase/strains";

export const dynamic = "force-dynamic";

const pageSize = 50;

function parsePage(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue ?? "1");

  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  params.set("page", String(Math.max(1, page)));

  return `/admin/storage?${params.toString()}`;
}

export default async function StorageAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    query?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const query = parseQuery(params.query);
  const [summary, result] = await Promise.all([
    getStorageSummary(),
    getStoragePage({ page, pageSize, query }),
  ]);
  const totalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
  const hasPrevious = result.page > 1;
  const hasNext = result.page < totalPages;
  const storageStats = [
    {
      label: "保存记录总数",
      value: summary.totalCount,
      unit: "条",
    },
    {
      label: "保存条件类型",
      value: summary.storageConditionCount,
      unit: "种",
    },
    {
      label: "保存设备编号",
      value: summary.freezerNumberCount,
      unit: "个",
    },
    {
      label: "保存位置点位",
      value: summary.storageLocationCount,
      unit: "个",
    },
  ];

  return (
    <main className="min-h-screen">
      <PageHeader
        title="保存位置管理"
        subtitle="用于管理菌株的保存条件、保存设备编号、保存位置和负责人。"
      />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          {storageStats.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-800">
                {item.value}
                <span className="ml-1 text-base font-medium text-emerald-700">
                  {item.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-xl font-semibold text-slate-950">
              保存位置记录
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              支持按菌株编号、属、来源、保存设备、保存位置和负责人检索保存记录。
            </p>
          </div>
          <div className="border-b border-slate-100 px-5 py-4">
            <form action="/admin/storage" className="flex flex-col gap-3 lg:flex-row">
              <label className="sr-only" htmlFor="storage-search">
                搜索保存记录
              </label>
              <input type="hidden" name="page" value="1" />
              <input
                id="storage-search"
                name="query"
                type="search"
                defaultValue={query}
                placeholder="搜索菌株编号、属、来源、保存设备、保存位置或负责人"
                className="h-12 w-full rounded-md border border-emerald-200 bg-white px-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                >
                  搜索
                </button>
                <Link
                  href="/admin/storage?page=1"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                >
                  清空搜索
                </Link>
              </div>
            </form>
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              共 {result.totalCount} 条记录，当前第 {result.page} / {totalPages} 页，每页展示 {pageSize} 条。
              {query ? ` 当前搜索：${query}` : ""}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-emerald-50 text-slate-700">
                <tr>
                  {[
                    "菌株编号",
                    "属 Genus",
                    "来源对象/作物",
                    "保存条件",
                    "保存设备编号",
                    "保存位置/区域",
                    "负责人",
                  ].map((heading, index) => (
                    <th key={`${heading}-${index}`} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.strains.map((strain, index) => (
                  <tr key={`${strain.code}-${index}`} className="hover:bg-emerald-50/50">
                    <td className="px-4 py-3 font-medium text-emerald-800">
                      {strain.code}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {strain.genus || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.crop || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.storageCondition || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.freezerNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.storageLocation || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.owner || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.strains.length === 0 ? (
            <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-600">
              暂无匹配的保存记录
            </div>
          ) : null}
          <nav className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={pageHref(result.page - 1, query)}
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
              当前第{" "}
              <span className="font-semibold text-slate-900">{result.page}</span>{" "}
              页 / 共{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>{" "}
              页，总记录数{" "}
              <span className="font-semibold text-slate-900">{result.totalCount}</span>
            </div>
            <Link
              href={pageHref(result.page + 1, query)}
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
        </section>
      </section>
    </main>
  );
}
