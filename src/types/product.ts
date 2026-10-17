export interface ProductCompatibility {
  socket?: string
  memoryType?: string
  supportedMemoryTypes?: string[]
  formFactor?: string
  supportedFormFactors?: string[]
  storageInterface?: string
  supportedStorageInterfaces?: string[]
  psuWattage?: number
  minimumPsuWatts?: number
  integratedGraphics?: boolean
}

export type ProductStore = 'amazon' | 'mercadolivre'
export type DealTag = 'menor-preco-30d' | 'acabou-de-cair' | 'em-alta' | 'novo'

export interface PriceHistoryPoint {
  date: string
  price: number
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  model: string
  category: string
  description: string
  specifications: Record<string, string>
  keywords: string[]
  dataSource: string
  image?: string
  price?: number
  originalPrice?: number
  discountPercent?: number
  priceUpdatedAt?: string
  affiliateUrl?: string
  store?: ProductStore
  lastCheckedAt?: string
  priceHistory?: PriceHistoryPoint[]
  available?: boolean
  dealTag?: DealTag
  editorialAssessment?: string
  compatibility?: ProductCompatibility
}

export interface ProductFilters {
  category?: string
  brand?: string
  sort?: 'relevance' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'
}
