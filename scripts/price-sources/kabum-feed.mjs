// Adaptador da KaBuM!: lê o feed de produtos que a rede de afiliados fornece (CSV ou JSON).
// Só é ativado quando KABUM_FEED_URL estiver definido. Os nomes das colunas variam de rede para rede:
// ajuste KABUM_FEED_COLUMNS (JSON) quando receber o feed real, por exemplo:
//   {"id":"sku","price":"price","originalPrice":"old_price","availability":"availability"}

const defaultColumns = { id: 'id', price: 'price', originalPrice: 'old_price', availability: 'availability' }

/** Aceita "1.299,90", "1299,90", "1299.90" e "R$ 1.299,90". */
export function parseMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value !== 'string') return undefined
  let text = value.replace(/[^\d.,]/g, '')
  if (!text) return undefined
  const lastComma = text.lastIndexOf(',')
  const lastDot = text.lastIndexOf('.')
  if (lastComma > lastDot) text = text.replace(/\./g, '').replace(',', '.')
  else if (lastDot > lastComma) text = text.replace(/,/g, '')
  const number = Number(text)
  return Number.isFinite(number) ? number : undefined
}

function splitCsvLine(line, delimiter) {
  const cells = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { current += '"'; index += 1 } else quoted = !quoted
    } else if (char === delimiter && !quoted) {
      cells.push(current); current = ''
    } else current += char
  }
  cells.push(current)
  return cells
}

export function parseFeed(text) {
  const trimmed = text.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const data = JSON.parse(trimmed)
    return Array.isArray(data) ? data : data.products ?? data.items ?? []
  }
  const lines = trimmed.split(/\r?\n/).filter(Boolean)
  if (!lines.length) return []
  const delimiter = [';', '\t', ','].sort((a, b) => lines[0].split(b).length - lines[0].split(a).length)[0]
  const header = splitCsvLine(lines[0], delimiter).map((cell) => cell.trim())
  return lines.slice(1).map((line) => Object.fromEntries(splitCsvLine(line, delimiter).map((cell, index) => [header[index], cell.trim()])))
}

export function createKabumFeedSource({ fetchImpl = fetch, env = process.env } = {}) {
  if (!env.KABUM_FEED_URL) return undefined
  const columns = { ...defaultColumns, ...(env.KABUM_FEED_COLUMNS ? JSON.parse(env.KABUM_FEED_COLUMNS) : {}) }
  let rowsById

  async function load() {
    if (rowsById) return rowsById
    const response = await fetchImpl(env.KABUM_FEED_URL, { headers: { accept: 'text/csv,application/json,*/*' } })
    if (!response.ok) throw new Error(`Feed da KaBuM! respondeu HTTP ${response.status}.`)
    rowsById = new Map(parseFeed(await response.text()).map((row) => [String(row[columns.id] ?? '').trim(), row]).filter(([id]) => id))
    return rowsById
  }

  return {
    store: 'kabum',
    canHandle: (entry) => entry.store === 'kabum' || /kabum\.com\.br/i.test(entry.affiliateUrl ?? ''),
    async fetchOffer(entry) {
      if (!entry.sourceId) throw new Error('Defina "sourceId" (o código do produto no feed da KaBuM!) neste produto no products.json.')
      const row = (await load()).get(String(entry.sourceId))
      if (!row) return { sourceId: entry.sourceId, available: false }
      const availability = String(row[columns.availability] ?? 'in stock').toLowerCase()
      return {
        sourceId: entry.sourceId,
        price: parseMoney(row[columns.price]),
        originalPrice: parseMoney(row[columns.originalPrice]),
        available: !/(out|esgot|indispon|false|^0$)/.test(availability),
      }
    },
  }
}
