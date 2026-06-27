"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export type StrainFormData = Partial<Record<FieldName, string | null>>;

type FieldName =
  | "code"
  | "sequencing_identified"
  | "sequencing_type"
  | "sequencing_company"
  | "sequence_text"
  | "phylum"
  | "class_name"
  | "order_name"
  | "family"
  | "genus"
  | "crop"
  | "source_part"
  | "collection_location"
  | "isolation_date"
  | "medium"
  | "temperature"
  | "storage_condition"
  | "freezer_number"
  | "storage_location"
  | "owner"
  | "has_patent"
  | "patent_name"
  | "has_paper"
  | "paper_name";

type FormField = {
  name: FieldName;
  label: string;
  type?: "input" | "textarea";
  placeholder?: string;
  required?: boolean;
};

type FormSection = {
  title: string;
  fields: FormField[];
};

type StrainFormProps = {
  mode: "create" | "edit";
  initialData?: StrainFormData;
};

const formSections: FormSection[] = [
  {
    title: "基本编号",
    fields: [
      {
        name: "code",
        label: "资源库内部编号",
        placeholder: "例如 L2P01A8",
        required: true,
      },
    ],
  },
  {
    title: "测序鉴定信息",
    fields: [
      { name: "sequencing_identified", label: "是否测序鉴定", placeholder: "是 / 否" },
      { name: "sequencing_type", label: "测序类型", placeholder: "例如 16S / ITS" },
      { name: "sequencing_company", label: "测序平台/公司" },
      { name: "phylum", label: "门Phylum" },
      { name: "class_name", label: "纲Class" },
      { name: "order_name", label: "目Order" },
      { name: "family", label: "科Family" },
      { name: "genus", label: "属Genus" },
      {
        name: "sequence_text",
        label: "鉴定序列",
        type: "textarea",
        placeholder: "请输入鉴定序列文本",
      },
    ],
  },
  {
    title: "分离培养信息",
    fields: [
      { name: "crop", label: "来源对象/作物", placeholder: "例如 油菜" },
      { name: "source_part", label: "来源组分", placeholder: "例如 根系" },
      { name: "collection_location", label: "采集地点" },
      { name: "isolation_date", label: "分离日期", placeholder: "例如 202105" },
      { name: "medium", label: "分离培养基", placeholder: "例如 TSB" },
      { name: "temperature", label: "温度", placeholder: "例如 28℃" },
    ],
  },
  {
    title: "保存信息",
    fields: [
      { name: "storage_condition", label: "保存条件", placeholder: "例如 负80℃冰箱" },
      { name: "freezer_number", label: "冰箱编号", placeholder: "例如 2号冰箱" },
      { name: "storage_location", label: "保存位置", placeholder: "例如 第4区" },
      { name: "owner", label: "负责人" },
    ],
  },
  {
    title: "成果信息",
    fields: [
      { name: "has_patent", label: "是否申请专利", placeholder: "是 / 否" },
      { name: "patent_name", label: "专利名称" },
      { name: "has_paper", label: "是否发表文章", placeholder: "是 / 否" },
      { name: "paper_name", label: "文章名称" },
    ],
  },
];

function formDataToPayload(formData: FormData) {
  const payload: Record<string, string> = {};

  for (const section of formSections) {
    for (const field of section.fields) {
      payload[field.name] = String(formData.get(field.name) ?? "");
    }
  }

  return payload;
}

function fieldValue(initialData: StrainFormData | undefined, field: FieldName) {
  return initialData?.[field] ?? "";
}

export function StrainForm({ mode, initialData }: StrainFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = formDataToPayload(formData);
    const code = payload.code.trim();

    setError("");
    setStatus("");

    if (!code) {
      setError("资源库内部编号 code 为必填项。");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/strains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        code?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "保存失败");
        return;
      }

      const savedCode = result.code ?? code;
      setStatus("保存成功");
      window.setTimeout(() => {
        router.push(`/strains/${encodeURIComponent(savedCode)}`);
      }, 500);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {isEdit ? "编辑菌株信息" : "新增菌株信息"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            表单字段与当前 Excel 资源库字段保持一致。
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? "保存中..." : isEdit ? "保存修改" : "保存菌株信息"}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {status}
        </div>
      ) : null}

      <div className="mt-6 space-y-8">
        {formSections.map((section, sectionIndex) => (
          <section
            key={`${section.title}-${sectionIndex}`}
            className="rounded-lg border border-slate-100 bg-slate-50/60 p-5"
          >
            <h2 className="text-lg font-semibold text-slate-950">
              {section.title}
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {section.fields.map((field, fieldIndex) => {
                const value = fieldValue(initialData, field.name);
                const codeIsLocked = isEdit && field.name === "code";

                return (
                  <label
                    key={`${section.title}-${field.name}-${fieldIndex}`}
                    className={
                      field.type === "textarea" ? "block md:col-span-2" : "block"
                    }
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required ? (
                        <span className="ml-1 text-red-600">*</span>
                      ) : null}
                    </span>
                    {codeIsLocked ? (
                      <input type="hidden" name="code" value={value} />
                    ) : null}
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        rows={7}
                        defaultValue={value}
                        placeholder={field.placeholder ?? `请输入${field.label}`}
                        className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 font-mono text-sm outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    ) : (
                      <input
                        name={codeIsLocked ? undefined : field.name}
                        type="text"
                        required={field.required}
                        disabled={codeIsLocked}
                        defaultValue={value}
                        placeholder={field.placeholder ?? `请输入${field.label}`}
                        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </form>
  );
}

