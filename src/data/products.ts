import catalog from './products.json'
import type { Product, ProductCompatibility } from '../types/product'

interface CatalogEntry {
  id?: string
  slug?: string
  name: string
  brand?: string
  model?: string
  category: string
  description?: string
  specifications?: Record<string, string | undefined>
  keywords?: string[]
  dataSource?: string
  image?: string
  price?: number
  priceUpdatedAt?: string
  affiliateUrl?: string
  compatibility?: ProductCompatibility
}

const catalogEntries = catalog as CatalogEntry[]
const seenIds = new Set<string>()
const seenSlugs = new Set<string>()

function createSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeCompatibility(value: ProductCompatibility | undefined): ProductCompatibility | undefined {
  if (!value || typeof value !== 'object') return undefined
  const text = (candidate: unknown) => typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined
  const list = (candidate: unknown) => Array.isArray(candidate)
    ? candidate.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim())
    : undefined
  const positiveNumber = (candidate: unknown) => typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0
    ? candidate
    : undefined
  const normalized: ProductCompatibility = {
    ...(text(value.socket) ? { socket: text(value.socket) } : {}),
    ...(text(value.memoryType) ? { memoryType: text(value.memoryType) } : {}),
    ...(list(value.supportedMemoryTypes) ? { supportedMemoryTypes: list(value.supportedMemoryTypes) } : {}),
    ...(text(value.formFactor) ? { formFactor: text(value.formFactor) } : {}),
    ...(list(value.supportedFormFactors) ? { supportedFormFactors: list(value.supportedFormFactors) } : {}),
    ...(text(value.storageInterface) ? { storageInterface: text(value.storageInterface) } : {}),
    ...(list(value.supportedStorageInterfaces) ? { supportedStorageInterfaces: list(value.supportedStorageInterfaces) } : {}),
    ...(positiveNumber(value.psuWattage) ? { psuWattage: positiveNumber(value.psuWattage) } : {}),
    ...(positiveNumber(value.minimumPsuWatts) ? { minimumPsuWatts: positiveNumber(value.minimumPsuWatts) } : {}),
    ...(typeof value.integratedGraphics === 'boolean' ? { integratedGraphics: value.integratedGraphics } : {}),
  }
  return Object.keys(normalized).length ? normalized : undefined
}

export const products: Product[] = catalogEntries.map((entry, index) => {
  if (!entry.name.trim() || !entry.category.trim()) {
    throw new Error(`Product catalog entry ${index + 1} must include a name and category.`)
  }
  const slug = entry.slug?.trim() || createSlug(entry.name)
  if (!slug) throw new Error(`Product catalog entry ${index + 1} needs a name that can form a URL slug.`)
  const id = entry.id?.trim() || slug
  if (seenIds.has(id)) throw new Error(`Duplicate product id in src/data/products.json: "${id}".`)
  if (seenSlugs.has(slug)) throw new Error(`Duplicate product slug in src/data/products.json: "${slug}".`)
  if (entry.image && (
    !/^\/products\/images\/[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(entry.image)
    || entry.image.includes('..')
  )) {
    throw new Error(`Invalid image path for "${entry.name}". Use /products/images/filename.jpg.`)
  }
  seenIds.add(id)
  seenSlugs.add(slug)
  const compatibility = normalizeCompatibility(entry.compatibility)

  return {
    id,
    slug,
    name: entry.name,
    brand: entry.brand?.trim() || 'Não informada',
    model: entry.model?.trim() || 'Não informado',
    category: entry.category,
    description: entry.description?.trim() || 'Consulte a página do fabricante para informações detalhadas sobre este produto.',
    specifications: Object.fromEntries(
      Object.entries(entry.specifications ?? {}).filter((specification): specification is [string, string] =>
        typeof specification[1] === 'string',
      ),
    ),
    keywords: entry.keywords ?? [],
    dataSource: entry.dataSource?.trim() || 'Informado manualmente pelo editor',
    ...(entry.image ? { image: entry.image } : {}),
    ...(typeof entry.price === 'number' ? { price: entry.price } : {}),
    ...(entry.priceUpdatedAt ? { priceUpdatedAt: entry.priceUpdatedAt } : {}),
    ...(entry.affiliateUrl ? { affiliateUrl: entry.affiliateUrl } : {}),
    ...(compatibility ? { compatibility } : {}),
  }
})
