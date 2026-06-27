import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { supabaseAdmin } from './supabase-admin.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const strainsPath = path.join(projectRoot, 'src', 'data', 'strains.json')
const batchSize = 500

function cleanValue(value) {
  if (value === null || value === undefined) {
    return null
  }

  const cleaned = String(value).trim()
  return cleaned ? cleaned : null
}

function mapStrain(strain) {
  return {
    code: cleanValue(strain.code),
    sequencing_identified: cleanValue(strain.sequencingIdentified),
    sequencing_type: cleanValue(strain.sequencingType),
    sequencing_company: cleanValue(strain.sequencingCompany),
    sequence_text: cleanValue(strain.sequenceText),
    phylum: cleanValue(strain.phylum),
    class_name: cleanValue(strain.className),
    order_name: cleanValue(strain.order),
    family: cleanValue(strain.family),
    genus: cleanValue(strain.genus),
    crop: cleanValue(strain.crop),
    source_part: cleanValue(strain.sourcePart),
    collection_location: cleanValue(strain.collectionLocation),
    isolation_date: cleanValue(strain.isolationDate),
    medium: cleanValue(strain.medium),
    temperature: cleanValue(strain.temperature),
    storage_condition: cleanValue(strain.storageCondition),
    freezer_number: cleanValue(strain.freezerNumber),
    original_freezer_number: cleanValue(strain.originalFreezerNumber),
    storage_location: cleanValue(strain.storageLocation),
    owner: cleanValue(strain.owner),
    has_patent: cleanValue(strain.hasPatent),
    patent_name: cleanValue(strain.patentName),
    has_paper: cleanValue(strain.hasPaper),
    paper_name: cleanValue(strain.paperName),
  }
}

function chunk(records, size) {
  const chunks = []

  for (let index = 0; index < records.length; index += size) {
    chunks.push(records.slice(index, index + size))
  }

  return chunks
}

if (!fs.existsSync(strainsPath)) {
  throw new Error(`strains.json not found: ${strainsPath}`)
}

const strains = JSON.parse(fs.readFileSync(strainsPath, 'utf8'))

if (!Array.isArray(strains)) {
  throw new Error('src/data/strains.json must contain a JSON array')
}

const recordsByCode = new Map()
let skippedCount = 0

for (const strain of strains) {
  const record = mapStrain(strain)

  if (!record.code) {
    skippedCount += 1
    continue
  }

  if (recordsByCode.has(record.code)) {
    skippedCount += 1
    continue
  }

  recordsByCode.set(record.code, record)
}

const records = [...recordsByCode.values()]
const samples = records.slice(0, 5)
let successCount = 0
let failedCount = 0

function printSummary() {
  console.log('\n=== Supabase import summary ===')
  console.log(`JSON total records: ${strains.length}`)
  console.log(`Successfully imported: ${successCount}`)
  console.log(`Skipped: ${skippedCount}`)
  console.log(`Failed: ${failedCount}`)
  console.log('First 5 import samples:')
  console.log(JSON.stringify(samples, null, 2))
}

const { error: tableCheckError } = await supabaseAdmin
  .schema('public')
  .from('microbe_strains')
  .select('code')
  .limit(1)

if (tableCheckError) {
  failedCount = records.length
  console.log(
    `Unable to access public.microbe_strains: ${tableCheckError.message}`,
  )
  process.exitCode = 1
} else {
  for (const [batchIndex, batch] of chunk(records, batchSize).entries()) {
    const { error } = await supabaseAdmin
      .schema('public')
      .from('microbe_strains')
      .upsert(batch, { onConflict: 'code' })

    if (error) {
      failedCount += batch.length
      console.log(
        `Batch ${batchIndex + 1} failed (${batch.length} records): ${error.message}`,
      )
      continue
    }

    successCount += batch.length
    console.log(`Batch ${batchIndex + 1} imported: ${batch.length}`)
  }
}

printSummary()

if (failedCount > 0) {
  process.exitCode = 1
}
