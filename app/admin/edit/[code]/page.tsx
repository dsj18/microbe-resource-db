import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { StrainForm } from "@/src/components/StrainForm";
import { getStrainByCode } from "@/src/lib/supabase/strains";

export const dynamic = "force-dynamic";

export default async function EditStrainPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);
  const strain = await getStrainByCode(decodedCode);

  if (!strain) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">未找到该菌株</h1>
        <p className="mt-3 text-slate-600">
          请返回菌株列表，确认菌株编号后重新访问。
        </p>
        <Link
          href="/strains"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          返回菌株列表
        </Link>
      </main>
    );
  }

  const detailHref = `/strains/${encodeURIComponent(strain.code)}`;

  return (
    <main className="min-h-screen">
      <PageHeader
        title="编辑菌株信息"
        subtitle={`正在编辑：${strain.code}`}
        action={{ href: detailHref, label: "返回详情页" }}
      />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          当前正在编辑已有菌株记录，保存后将同步到菌株列表、详情页、保存位置管理、二维码管理和序列文献管理模块。
        </div>

        <StrainForm mode="edit" initialData={strain} />
      </section>
    </main>
  );
}

