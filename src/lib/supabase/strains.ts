import { supabase } from "@/src/lib/supabase/server";
import type { Strain } from "@/src/data/strains";

export type MicrobeStrain = {
  id: string;
  code: string;
  sequencing_identified: string | null;
  sequencing_type: string | null;
  sequencing_company: string | null;
  sequence_text: string | null;
  phylum: string | null;
  class_name: string | null;
  order_name: string | null;
  family: string | null;
  genus: string | null;
  crop: string | null;
  source_part: string | null;
  collection_location: string | null;
  isolation_date: string | null;
  medium: string | null;
  temperature: string | null;
  storage_condition: string | null;
  freezer_number: string | null;
  original_freezer_number: string | null;
  storage_location: string | null;
  owner: string | null;
  has_patent: string | null;
  patent_name: string | null;
  has_paper: string | null;
  paper_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const listColumns = [
  "id",
  "code",
  "sequencing_identified",
  "sequencing_type",
  "phylum",
  "class_name",
  "family",
  "genus",
  "crop",
  "source_part",
  "collection_location",
  "storage_condition",
  "freezer_number",
  "original_freezer_number",
  "storage_location",
  "owner",
].join(",");

const allColumns = [
  "id",
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
  "original_freezer_number",
  "storage_location",
  "owner",
  "has_patent",
  "patent_name",
  "has_paper",
  "paper_name",
  "created_at",
  "updated_at",
].join(",");

export function toDisplayStrain(strain: MicrobeStrain): Strain {
  return {
    code: strain.code,
    sequencingIdentified: strain.sequencing_identified ?? "",
    sequencingType: strain.sequencing_type ?? "",
    sequencingCompany: strain.sequencing_company ?? "",
    sequenceText: strain.sequence_text ?? "",
    phylum: strain.phylum ?? "",
    className: strain.class_name ?? "",
    order: strain.order_name ?? "",
    family: strain.family ?? "",
    genus: strain.genus ?? "",
    crop: strain.crop ?? "",
    sourcePart: strain.source_part ?? "",
    collectionLocation: strain.collection_location ?? "",
    isolationDate: strain.isolation_date ?? "",
    medium: strain.medium ?? "",
    temperature: strain.temperature ?? "",
    storageCondition: strain.storage_condition ?? "",
    freezerNumber: strain.freezer_number ?? "",
    originalFreezerNumber: strain.original_freezer_number ?? "",
    storageLocation: strain.storage_location ?? "",
    owner: strain.owner ?? "",
    hasPatent: strain.has_patent ?? "",
    patentName: strain.patent_name ?? "",
    hasPaper: strain.has_paper ?? "",
    paperName: strain.paper_name ?? "",
  };
}

function cleanSearchQuery(query: string) {
  return query.trim().replace(/[%_,()."']/g, " ").replace(/\s+/g, " ");
}

function buildIlikeFilters(fields: string[], query: string) {
  const cleanedQuery = cleanSearchQuery(query);

  if (!cleanedQuery) {
    return "";
  }

  const pattern = `%${cleanedQuery}%`;

  return fields.map((field) => `${field}.ilike.${pattern}`).join(",");
}

function applySearch<T>(queryBuilder: T, query: string): T {
  const filters = buildIlikeFilters(
    [
    "code",
    "genus",
    "crop",
    "source_part",
    "collection_location",
    "freezer_number",
    "storage_location",
    "owner",
    ],
    query,
  );

  if (!filters) {
    return queryBuilder;
  }

  return (queryBuilder as { or: (filters: string) => T }).or(filters);
}

function applyQrCodeSearch<T>(queryBuilder: T, query: string): T {
  const filters = buildIlikeFilters(
    [
      "code",
      "genus",
      "crop",
      "source_part",
      "freezer_number",
      "storage_location",
    ],
    query,
  );

  if (!filters) {
    return queryBuilder;
  }

  return (queryBuilder as { or: (filters: string) => T }).or(filters);
}

export async function getStrainCount() {
  const { count, error } = await supabase
    .from("microbe_strains")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to count microbe_strains: ${error.message}`);
  }

  return count ?? 0;
}

export async function getStrainExamples(limit = 6) {
  const { data, error } = await supabase
    .from("microbe_strains")
    .select(listColumns)
    .order("code", { ascending: true })
    .limit(limit)
    .returns<MicrobeStrain[]>();

  if (error) {
    throw new Error(`Failed to fetch strain examples: ${error.message}`);
  }

  return (data ?? []).map(toDisplayStrain);
}

export async function getStrainsPage({
  page,
  pageSize,
  query,
}: {
  page: number;
  pageSize: number;
  query: string;
}) {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  let request = supabase
    .from("microbe_strains")
    .select(listColumns, { count: "exact" });

  request = applySearch(request, query);

  const { data, count, error } = await request
    .order("code", { ascending: true })
    .range(from, to)
    .returns<MicrobeStrain[]>();

  if (error) {
    throw new Error(`Failed to fetch strains page: ${error.message}`);
  }

  return {
    strains: (data ?? []).map(toDisplayStrain),
    totalCount: count ?? 0,
    page: currentPage,
    pageSize,
  };
}

export async function getStrainByCode(code: string) {
  const { data, error } = await supabase
    .from("microbe_strains")
    .select(allColumns)
    .eq("code", code)
    .maybeSingle<MicrobeStrain>();

  if (error) {
    throw new Error(`Failed to fetch strain ${code}: ${error.message}`);
  }

  return data;
}

export async function getStorageSummary() {
  const totalCount = await getStrainCount();
  const rows: Pick<
    MicrobeStrain,
    "storage_condition" | "freezer_number" | "storage_location"
  >[] = [];
  const pageSize = 1000;

  for (let from = 0; from < totalCount; from += pageSize) {
    const { data, error } = await supabase
      .from("microbe_strains")
      .select("storage_condition,freezer_number,storage_location")
      .range(from, Math.min(from + pageSize - 1, totalCount - 1))
      .returns<
        Pick<
          MicrobeStrain,
          "storage_condition" | "freezer_number" | "storage_location"
        >[]
      >();

    if (error) {
      throw new Error(`Failed to fetch storage summary: ${error.message}`);
    }

    rows.push(...(data ?? []));
  }

  return {
    totalCount,
    storageConditionCount: new Set(
      rows.map((row) => row.storage_condition).filter(Boolean),
    ).size,
    freezerNumberCount: new Set(
      rows.map((row) => row.freezer_number).filter(Boolean),
    ).size,
    storageLocationCount: new Set(
      rows.map((row) => row.storage_location).filter(Boolean),
    ).size,
  };
}

export async function getStorageRows(limit = 100) {
  const { data, error } = await supabase
    .from("microbe_strains")
    .select(listColumns)
    .order("code", { ascending: true })
    .limit(limit)
    .returns<MicrobeStrain[]>();

  if (error) {
    throw new Error(`Failed to fetch storage rows: ${error.message}`);
  }

  return (data ?? []).map(toDisplayStrain);
}

export async function getQrCodeRows(limit = 100) {
  const { data, error } = await supabase
    .from("microbe_strains")
    .select("code,genus,crop,source_part,freezer_number,storage_location")
    .order("code", { ascending: true })
    .limit(limit)
    .returns<MicrobeStrain[]>();

  if (error) {
    throw new Error(`Failed to fetch QR code rows: ${error.message}`);
  }

  return (data ?? []).map(toDisplayStrain);
}

export async function getQrCodePage({
  page,
  pageSize,
  query,
}: {
  page: number;
  pageSize: number;
  query: string;
}) {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  let request = supabase
    .from("microbe_strains")
    .select("code,genus,crop,source_part,freezer_number,storage_location", {
      count: "exact",
    });

  request = applyQrCodeSearch(request, query);

  const { data, count, error } = await request
    .order("code", { ascending: true })
    .range(from, to)
    .returns<MicrobeStrain[]>();

  if (error) {
    throw new Error(`Failed to fetch QR code page: ${error.message}`);
  }

  return {
    strains: (data ?? []).map(toDisplayStrain),
    totalCount: count ?? 0,
    page: currentPage,
    pageSize,
  };
}

export async function getReferenceRows(limit = 100) {
  const { data, error } = await supabase
    .from("microbe_strains")
    .select("code,genus,sequencing_type,sequence_text,has_paper,paper_name")
    .order("code", { ascending: true })
    .limit(limit)
    .returns<MicrobeStrain[]>();

  if (error) {
    throw new Error(`Failed to fetch reference rows: ${error.message}`);
  }

  return (data ?? []).map(toDisplayStrain);
}
