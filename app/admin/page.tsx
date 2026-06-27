import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { StrainForm } from "@/src/components/StrainForm";

const futurePlans = [
  "完善后台编辑、删除和批量校验流程",
  "为新增记录增加更细致的字段校验和权限控制",
  "支持保存后继续新增下一条记录",
  "支持 Excel 批量导入与字段校验",
  "支持文件上传，包括图片、序列文件和论文 PDF",
];

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

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">后续计划</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {futurePlans.map((plan, index) => (
              <li
                key={`${plan}-${index}`}
                className="flex items-start gap-3 text-sm text-slate-700"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                {plan}
              </li>
            ))}
          </ul>
        </section>

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
