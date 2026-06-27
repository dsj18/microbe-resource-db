import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { getReferencePage } from "@/src/lib/supabase/strains";

function getSequencePreview(sequence: string) {
  const text = sequence.trim();

  if (!text) {
    return "-";
  }

  return text.length > 60 ? `${text.slice(0, 60)}...` : text;
}

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

  return `/admin/references?${params.toString()}`;
}

export default async function ReferencesAdminPage({
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
  const result = await getReferencePage({ page, pageSize, query });
  const totalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
  const hasPrevious = result.page > 1;
  const hasNext = result.page < totalPages;

  return (
    <main className="min-h-screen">
      <PageHeader
        title="序列与文献管理"
        subtitle="用于集中管理菌株的鉴定序列、测序信息、相关论文和成果记录"
      />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">
              支持按菌株编号、属、测序类型、鉴定序列、论文和专利信息检索记录。
            </p>
          </div>
          <div className="border-b border-slate-100 px-5 py-4">
            <form action="/admin/references" className="flex flex-col gap-3 lg:flex-row">
              <label className="sr-only" htmlFor="reference-search">
                搜索序列与文献记录
              </label>
              <input type="hidden" name="page" value="1" />
              <input
                id="reference-search"
                name="query"
                type="search"
                defaultValue={query}
                placeholder="搜索菌株编号、属、测序类型、序列、论文或专利信息"
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
                  href="/admin/references?page=1"
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
                    "测序类型",
                    "鉴定序列预览",
                    "是否发表文章",
                    "文章名称",
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
                      {strain.sequencingType || "-"}
                    </td>
                    <td className="max-w-sm px-4 py-3 font-mono text-xs text-slate-600">
                      {getSequencePreview(strain.sequenceText)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.hasPaper || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {strain.paperName || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.strains.length === 0 ? (
            <div className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-600">
              暂无匹配的序列与文献记录
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
        </div>
      </section>
    </main>
  );
}
