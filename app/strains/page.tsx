import { PageHeader } from "@/src/components/PageHeader";
import { StrainsBrowser } from "@/src/components/StrainsBrowser";
import { getStrainsPage } from "@/src/lib/supabase/strains";

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

export default async function StrainsPage({
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
  const result = await getStrainsPage({ page, pageSize, query });

  return (
    <main className="min-h-screen">
      <PageHeader
        title="菌株列表"
        subtitle="浏览从 Supabase 数据库读取的肥料微生物资源库数据。"
        action={{ href: "/admin", label: "后台管理" }}
      />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <StrainsBrowser
          strains={result.strains}
          query={query}
          page={result.page}
          pageSize={result.pageSize}
          totalCount={result.totalCount}
        />
      </section>
    </main>
  );
}
