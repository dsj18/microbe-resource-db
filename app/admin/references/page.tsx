import { PageHeader } from "@/src/components/PageHeader";
import { getReferenceRows } from "@/src/lib/supabase/strains";

function getSequencePreview(sequence: string) {
  if (!sequence) {
    return "-";
  }

  return sequence.length > 48 ? `${sequence.slice(0, 48)}...` : sequence;
}

export const dynamic = "force-dynamic";

export default async function ReferencesAdminPage() {
  const strains = await getReferenceRows(100);

  return (
    <main className="min-h-screen">
      <PageHeader
        title="序列与文献管理"
        subtitle="用于集中管理菌株的鉴定序列、测序信息、相关论文和成果记录"
      />

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-600">默认展示前 100 条记录。</p>
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
                {strains.map((strain, index) => (
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
        </div>
      </section>
    </main>
  );
}
