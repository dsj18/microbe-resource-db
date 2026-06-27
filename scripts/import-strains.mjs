import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const inputPath = path.join(
  projectRoot,
  "data",
  "LiN Group微生物资源库_all_20260625.xlsx",
);
const outputPath = path.join(projectRoot, "src", "data", "strains.json");

const fieldMap = {
  code: "资源库内部编号",
  sequencingIdentified: "是否测序鉴定",
  sequencingType: "测序类型",
  sequencingCompany: "测序平台/公司",
  sequenceText: "鉴定序列",
  phylum: "门Phylum",
  className: "纲Class",
  order: "目Order",
  family: "科Family",
  genus: "属Genus",
  crop: "来源对象/作物",
  sourcePart: "来源组分",
  collectionLocation: "采集地点",
  isolationDate: "分离日期",
  medium: "分离培养基",
  temperature: "温度",
  storageCondition: "保存条件",
  freezerNumber: "冰箱编号",
  storageLocation: "保存位置",
  owner: "负责人",
  hasPatent: "是否申请专利",
  patentName: "专利名称",
  hasPaper: "是否发表文章",
  paperName: "文章名称",
};

function cleanCell(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeFreezerNumber(value) {
  const cleanedValue = cleanCell(value);
  const freezerMatch = cleanedValue.match(/^([1-4])号冰箱$/);

  if (freezerMatch) {
    return `${freezerMatch[1]}号`;
  }

  return cleanedValue;
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`Excel 文件不存在：${inputPath}`);
}

const workbook = XLSX.readFile(inputPath, { cellDates: true });
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

if (!worksheet) {
  throw new Error("Excel 文件中没有可读取的工作表");
}

const rows = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: "",
  raw: false,
});
const categoryRow = rows[0] ?? [];
const headerRow = rows[1];
const dataRows = rows.slice(2);

if (!Array.isArray(headerRow)) {
  throw new Error("未找到第 2 行字段名");
}

const headerIndex = new Map(
  headerRow.map((header, index) => [
    cleanCell(header) || cleanCell(categoryRow[index]),
    index,
  ]),
);

for (const requiredHeader of Object.values(fieldMap)) {
  if (!headerIndex.has(requiredHeader)) {
    throw new Error(`Excel 第 2 行缺少字段：${requiredHeader}`);
  }
}

const strains = dataRows
  .map((row) => {
    const item = {};

    for (const [targetField, sourceHeader] of Object.entries(fieldMap)) {
      const cellIndex = headerIndex.get(sourceHeader);
      item[targetField] = cleanCell(row[cellIndex]);
    }

    item.originalFreezerNumber = item.freezerNumber;
    item.freezerNumber = normalizeFreezerNumber(item.freezerNumber);

    return item;
  })
  .filter((item) => item.code);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(strains, null, 2)}\n`, "utf8");

console.log(
  `Imported ${strains.length} strains to ${path.relative(projectRoot, outputPath)}`,
);
