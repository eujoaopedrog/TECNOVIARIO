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
  priceUpdatedAt?: string
  affiliateUrl?: string
  compatibility?: ProductCompatibility
}

export interface ProductFilters {
  category?: string
  brand?: string
  sort?: 'relevance' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'
}
