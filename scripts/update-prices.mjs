// Atualiza preço, disponibilidade e histórico dos produtos em src/data/products.json.
//
// Uso:  node scripts/update-prices.mjs [--dry-run] [--catalog caminho/para/products.json]
//
// Regras de segurança (iguais às do README do projeto):
//  - Só grava dados que vieram da loja. Se a consulta falhar, o produto fica intacto
//    (o preço expira sozinho em 24 h; nunca "renovamos" um preço sem confirmar).
//  - Lojas sem fonte automática autorizada (ex.: Amazon, enquanto não houver Creators API)
//    são ignoradas e continuam sendo atualizadas manualmente.
import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createKabumFeedSource } from './price-sources/kabum-feed.mjs'
import { createMercadoLivreSource } from './price-sources/mercadolivre.mjs'

const MAX_HISTORY_POINTS = 120
const HISTORY_MIN_GAP_MS = 24 * 60 * 60 * 1000

function roundMoney(value) {
  return Math.round(value * 100) / 100
}

function applyOffer(entry, offer, nowIso, sourceLabel) {
  const next = { ...entry }
  if (offer.sourceId) next.sourceId = offer.sourceId
  next.lastCheckedAt = nowIso
  next.priceUpdatedAt = nowIso

  const validPrice = typeof offer.price === 'number' && Number.isFinite(offer.price) && offer.price > 0
  if (!offer.available || !validPrice) {
    next.available = false
    next.dataSource = `${sourceLabel}: indisponível em ${nowIso}`
    return next
  }

  const price = roundMoney(offer.price)
  next.available = true
  next.price = price
  if (typeof offer.originalPrice === 'number' && offer.originalPrice > price) next.originalPrice = roundMoney(offer.originalPrice)
  else delete next.originalPrice
  delete next.discountPercent // o site calcula o desconto a partir de originalPrice e price
  next.dataSource = `${sourceLabel}: verificado em ${nowIso}`

  const history = Array.isArray(entry.priceHistory) ? [...entry.priceHistory] : []
  const last = history[history.length - 1]
  const lastTime = last ? Date.parse(last.date) : Number.NaN
  if (!last || last.price !== price || !(Date.parse(nowIso) - lastTime < HISTORY_MIN_GAP_MS)) {
    history.push({ date: nowIso, price })
  }
  next.priceHistory = history.slice(-MAX_HISTORY_POINTS)
  return next
}

const sourceLabels = { mercadolivre: 'API do Mercado Livre', kabum: 'Feed de afiliados da KaBuM!' }

/** Função pura: recebe o catálogo e as fontes, devolve o catálogo novo e um relatório. */
export async function updateCatalog(entries, sources, now = new Date()) {
  const nowIso = now.toISOString()
  const report = { updated: [], unavailable: [], skipped: [], failed: [] }
  const result = []
  for (const entry of entries) {
    const source = sources.find((candidate) => candidate.canHandle(entry))
    if (!source) {
      report.skipped.push({ name: entry.name, reason: 'sem fonte automática (atualização manual)' })
      result.push(entry)
      continue
    }
    try {
      const offer = await source.fetchOffer(entry)
      const updated = applyOffer(entry, offer, nowIso, sourceLabels[source.store] ?? source.store)
      ;(updated.available ? report.updated : report.unavailable).push({ name: entry.name, price: updated.price })
      result.push(updated)
    } catch (error) {
      report.failed.push({ name: entry.name, reason: error instanceof Error ? error.message : String(error) })
      result.push(entry)
    }
  }
  return { entries: result, report }
}

export function buildSources(env = process.env, fetchImpl = fetch) {
  return [createMercadoLivreSource({ env, fetchImpl }), createKabumFeedSource({ env, fetchImpl })].filter(Boolean)
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const catalogFlag = args.indexOf('--catalog')
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const catalogPath = catalogFlag >= 0 ? path.resolve(args[catalogFlag + 1]) : path.join(root, 'src', 'data', 'products.json')

  const entries = JSON.parse(await readFile(catalogPath, 'utf8'))
  const { entries: updatedEntries, report } = await updateCatalog(entries, buildSources())

  console.log(`Atualizados: ${report.updated.length} | Indisponíveis: ${report.unavailable.length} | Ignorados: ${report.skipped.length} | Falhas: ${report.failed.length}`)
  for (const item of report.updated) console.log(`  ok    ${item.name} -> R$ ${item.price}`)
  for (const item of report.unavailable) console.log(`  fora  ${item.name}`)
  for (const item of report.failed) console.log(`  FALHA ${item.name}: ${item.reason}`)

  const nextText = `${JSON.stringify(updatedEntries, null, 2)}\n`
  if (dryRun) {
    console.log('Modo --dry-run: nada foi gravado.')
  } else if (nextText !== `${JSON.stringify(entries, null, 2)}\n`) {
    const temporaryPath = `${catalogPath}.tmp`
    await writeFile(temporaryPath, nextText, 'utf8')
    await rename(temporaryPath, catalogPath)
    console.log(`Catálogo gravado em ${catalogPath}`)
  }

  const attempted = report.updated.length + report.unavailable.length + report.failed.length
  if (attempted > 0 && report.failed.length === attempted) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
