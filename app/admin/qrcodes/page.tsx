import { PageHeader } from "@/src/components/PageHeader";
import { QrCodeCard } from "@/src/components/QrCodeCard";
import { getQrCodeRows } from "@/src/lib/supabase/strains";

export const dynamic = "force-dynamic";

export default async function QrCodesAdminPage() {
  const strains = await getQrCodeRows(100);
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
          二维码内容为菌株详情页完整链接。当前本地开发使用 localhost，部署上线后可通过 NEXT_PUBLIC_SITE_URL 自动切换为公网域名。
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
          当前仅展示前100条二维码记录，后续可加入分页和批量下载。
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-6 py-8 md:grid-cols-2">
        {strains.map((strain, index) => (
          <QrCodeCard
            key={`${strain.code}-${index}`}
            strain={strain}
            detailUrl={`${baseUrl}/strains/${encodeURIComponent(strain.code)}`}
          />
        ))}
      </section>
    </main>
  );
}
