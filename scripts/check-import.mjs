import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const excelPath = path.join(
  projectRoot,
  "data",
  "LiN Group微生物资源库_all_20260625.xlsx",
);
const jsonPath = path.join(projectRoot, "src", "data", "strains.json");

const expectedColumns = [
  ["A", "code", "资源库内部编号"],
  ["B", "sequencingIdentified", "是否测序鉴定"],
  ["C", "sequencingType", "测序类型"],
  ["D", "sequencingCompany", "测序平台/公司"],
  ["E", "sequenceText", "鉴定序列"],
  ["F", "phylum", "门Phylum"],
  ["G", "className", "纲Class"],
  ["H", "order", "目Order"],
  ["I", "family", "科Family"],
  ["J", "genus", "属Genus"],
  ["K", "crop", "来源对象/作物"],
  ["L", "sourcePart", "来源组分"],
  ["M", "collectionLocation", "采集地点"],
  ["N", "isolationDate", "分离日期"],
  ["O", "medium", "分离培养基"],
  ["P", "temperature", "温度"],
  ["Q", "storageCondition", "保存条件"],
  ["R", "freezerNumber", "冰箱编号"],
  ["S", "storageLocation", "保存位置"],
  ["T", "owner", "负责人"],
  ["U", "hasPatent", "是否申请专利"],
  ["V", "patentName", "专利名称"],
  ["W", "hasPaper", "是否发表文章"],
  ["X", "paperName", "文章名称"],
];

function cleanCell(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function uniqueValues(records, field) {
  return [...new Set(records.map((record) => record[field]).filter(Boolean))];
}

function frequency(records, field) {
  const counts = new Map();

  for (const record of records) {
    const value = record[field] || "(空)";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([value, count]) => ({ value, count }));
}

if (!fs.existsSync(excelPath)) {
  throw new Error(`Excel 文件不存在：${excelPath}`);
}

if (!fs.existsSync(jsonPath)) {
  throw new Error(`导入后的 JSON 文件不存在：${jsonPath}`);
}

const workbook = XLSX.readFile(excelPath, { cellDates: true });
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: "",
  raw: false,
});
const categoryRow = rows[0] ?? [];
const headerRow = rows[1] ?? [];
const dataRows = rows.slice(2);
const strains = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const columnReport = expectedColumns.map(([column, field, expected], index) => {
  const header = cleanCell(headerRow[index]) || cleanCell(categoryRow[index]);
  const matched = header === expected;

  return {
    column,
    field,
    expected,
    actualHeader: header,
    matched,
  };
});

const firstTenRows = dataRows.slice(0, 10).map((row, rowIndex) => {
  const excelRow = { excelRowNumber: rowIndex + 3 };

  expectedColumns.forEach(([column, field], index) => {
    excelRow[`${column}_${field}`] = cleanCell(row[index]);
  });

  return excelRow;
});

const duplicateCodes = strains.length - new Set(strains.map((strain) => strain.code)).size;

console.log("=== Excel A-X 字段映射检查 ===");
console.table(columnReport);

console.log("\n=== Excel 前 10 条原始行（第 3-12 行） ===");
console.log(JSON.stringify(firstTenRows, null, 2));

console.log("\n=== 导入后的前 10 条 JSON 数据 ===");
console.log(JSON.stringify(strains.slice(0, 10), null, 2));

console.log("\n=== 导入统计 ===");
console.log(`总记录数: ${strains.length}`);
console.log(`Excel 数据行数（从第 3 行开始）: ${dataRows.filter((row) => cleanCell(row[0])).length}`);
console.log(`code 唯一数量: ${new Set(strains.map((strain) => strain.code)).size}`);
console.log(`重复 code 数量: ${duplicateCodes}`);

console.log("\n保存条件唯一值:");
console.log(uniqueValues(strains, "storageCondition"));

console.log("\n冰箱编号唯一值:");
console.log(uniqueValues(strains, "freezerNumber"));

console.log("\n保存位置唯一值:");
console.log(uniqueValues(strains, "storageLocation"));

console.log("\n属 Genus 前 20 个高频值:");
console.table(frequency(strains, "genus"));

console.log("\n来源对象/作物唯一值:");
console.log(uniqueValues(strains, "crop"));
