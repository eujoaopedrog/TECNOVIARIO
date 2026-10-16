import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description: string
  noIndex?: boolean
}

export function PageMeta({ title, description, noIndex = false }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} | Tecnoviario`
    let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta')
      descriptionMeta.name = 'description'
      document.head.append(descriptionMeta)
    }
    descriptionMeta.content = description
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.name = 'robots'
      document.head.append(robotsMeta)
    }
    robotsMeta.content = noIndex ? 'noindex,follow' : 'index,follow'
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`
  }, [title, description, noIndex])
  return null
}
