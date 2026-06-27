import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const fields = [
  "code",
  "sequencing_identified",
  "sequencing_type",
  "sequencing_company",
  "sequence_text",
  "phylum",
  "class_name",
  "order_name",
  "family",
  "genus",
  "crop",
  "source_part",
  "collection_location",
  "isolation_date",
  "medium",
  "temperature",
  "storage_condition",
  "freezer_number",
  "storage_location",
  "owner",
  "has_patent",
  "patent_name",
  "has_paper",
  "paper_name",
] as const;

type FieldName = (typeof fields)[number];
type RequestBody = Partial<Record<FieldName, unknown>>;

function cleanText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = String(value).trim();
  return cleaned ? cleaned : null;
}

function normalizeFreezerNumber(value: unknown) {
  const original = cleanText(value);

  if (!original) {
    return {
      freezerNumber: null,
      originalFreezerNumber: null,
    };
  }

  const normalized = original.replace(/^([1-4])号冰箱$/, "$1号");

  return {
    freezerNumber: normalized,
    originalFreezerNumber: original,
  };
}

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Missing Supabase server environment variables" },
      { status: 500 },
    );
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = cleanText(body.code);

  if (!code) {
    return Response.json(
      { error: "资源库内部编号 code 为必填项。" },
      { status: 400 },
    );
  }

  const { freezerNumber, originalFreezerNumber } = normalizeFreezerNumber(
    body.freezer_number,
  );
  const record: Record<string, string | null> = {
    code,
    original_freezer_number: originalFreezerNumber,
  };

  for (const field of fields) {
    if (field === "code" || field === "freezer_number") {
      continue;
    }

    record[field] = cleanText(body[field]);
  }

  record.freezer_number = freezerNumber;

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data, error } = await supabaseAdmin
    .from("microbe_strains")
    .upsert(record, { onConflict: "code" })
    .select("code")
    .single<{ code: string }>();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/strains");
  revalidatePath(`/strains/${code}`);
  revalidatePath("/admin/storage");
  revalidatePath("/admin/qrcodes");
  revalidatePath("/admin/references");

  return Response.json({ code: data.code });
}

