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
  isDemo: boolean
  image?: string
  price?: number
  priceUpdatedAt?: string
  affiliateUrl?: string
}

export interface ProductFilters {
  category?: string
  brand?: string
  sort?: 'relevance' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'
}
