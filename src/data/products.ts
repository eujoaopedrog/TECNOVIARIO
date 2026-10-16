import catalog from './products.json'
import type { Product } from '../types/product'

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
  isDemo?: boolean
  image?: string
  price?: number
  priceUpdatedAt?: string
  affiliateUrl?: string
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
    isDemo: entry.isDemo ?? false,
    ...(entry.image ? { image: entry.image } : {}),
    ...(typeof entry.price === 'number' ? { price: entry.price } : {}),
    ...(entry.priceUpdatedAt ? { priceUpdatedAt: entry.priceUpdatedAt } : {}),
    ...(entry.affiliateUrl ? { affiliateUrl: entry.affiliateUrl } : {}),
  }
})
