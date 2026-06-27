import { PageHeader } from "@/src/components/PageHeader";
import {
  getStorageRows,
  getStorageSummary,
} from "@/src/lib/supabase/strains";

export const dynamic = "force-dynamic";

export default async function StorageAdminPage() {
  const [summary, strains] = await Promise.all([
    getStorageSummary(),
    getStorageRows(100),
  ]);
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
              表格默认展示前 100 条保存记录。
            </p>
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
                {strains.map((strain, index) => (
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
        </section>
      </section>
    </main>
  );
}
