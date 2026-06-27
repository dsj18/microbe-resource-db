import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { QrBatchDownloadButton } from "@/src/components/QrBatchDownloadButton";
import { QrCodeCard } from "@/src/components/QrCodeCard";
import { getQrCodePage } from "@/src/lib/supabase/strains";

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

  return `/admin/qrcodes?${params.toString()}`;
}

export default async function QrCodesAdminPage({
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
  const result = await getQrCodePage({ page, pageSize, query });
  const totalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
  const hasPrevious = result.page > 1;
  const hasNext = result.page < totalPages;
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  return (
    <main className="min-h-screen">
      <PageHeader
        title="二维码管理"
        subtitle="用于为每个菌株生成详情页二维码，扫码后进入对应菌株详情页"
      />

      <section className="mx-auto w-full max-w-6xl px-6 pt-8">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          二维码内容为菌株详情页公网链接，扫码后可直接进入对应菌株详情页。当前系统公网地址：https://microbe-resource-db.vercel.app
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <form action="/admin/qrcodes" className="flex flex-col gap-3 lg:flex-row">
            <label className="sr-only" htmlFor="qr-search">
              搜索二维码记录
            </label>
            <input type="hidden" name="page" value="1" />
            <input
              id="qr-search"
              name="query"
              type="search"
              defaultValue={query}
              placeholder="搜索编号、属名、作物、来源组分、冰箱编号或保存位置"
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
                href="/admin/qrcodes?page=1"
                className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
              >
                清空搜索
              </Link>
            </div>
          </form>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              共 {result.totalCount} 条记录，当前第 {result.page} / {totalPages} 页，每页展示 {pageSize} 条。
              {query ? ` 当前搜索：${query}` : ""}
            </div>
            <QrBatchDownloadButton page={result.page} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-8 md:grid-cols-2">
        {result.strains.map((strain, index) => (
          <QrCodeCard
            key={`${strain.code}-${index}`}
            strain={strain}
            detailUrl={`${baseUrl}/strains/${encodeURIComponent(strain.code)}`}
          />
        ))}
      </section>

      {result.strains.length === 0 ? (
        <section className="mx-auto w-full max-w-6xl px-6 pb-8">
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            未找到匹配记录。
          </div>
        </section>
      ) : null}

      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-10 sm:flex-row sm:items-center sm:justify-between">
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
          当前第 <span className="font-semibold text-slate-900">{result.page}</span>{" "}
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
    </main>
  );
}
