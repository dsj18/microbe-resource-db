import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { StrainForm } from "@/src/components/StrainForm";

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <PageHeader
        title="后台管理"
        subtitle="新增和维护肥料微生物资源库信息。"
      />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          当前已连接 Supabase 数据库，新增或更新记录将同步到菌株列表、详情页、保存位置管理、二维码管理和序列文献管理模块。
        </div>

        <StrainForm mode="create" />

        <Link
          href="/"
          className="mt-8 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          返回首页
        </Link>
      </section>
    </main>
  );
}
