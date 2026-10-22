// Adaptador do Mercado Livre: consulta a API oficial (api.mercadolibre.com).
// Credenciais (opcionais, mas recomendadas): ML_CLIENT_ID e ML_CLIENT_SECRET, de um app criado em
// https://developers.mercadolivre.com.br. Nunca coloque essas chaves no código do site.

const API = 'https://api.mercadolibre.com'
const MAX_REDIRECTS = 6

/** Extrai o ID do anúncio (MLB123...) de uma URL. Aceita /MLB-123-titulo, /p/MLB123 e ?item_id=MLB123. */
export function parseItemRef(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return undefined
  }
  const itemParam = parsed.searchParams.get('item_id') ?? parsed.searchParams.get('wid')
  if (itemParam && /^MLB\d+$/i.test(itemParam)) return { kind: 'item', id: itemParam.toUpperCase() }
  const catalog = parsed.pathname.match(/\/p\/(MLB\d+)/i)
  if (catalog) return { kind: 'product', id: catalog[1].toUpperCase() }
  const item = parsed.pathname.match(/MLB-?(\d{6,})/i)
  if (item) return { kind: 'item', id: `MLB${item[1]}` }
  return undefined
}

export function createMercadoLivreSource({ fetchImpl = fetch, env = process.env } = {}) {
  let token
  let tokenTried = false

  async function getToken() {
    if (tokenTried) return token
    tokenTried = true
    if (!env.ML_CLIENT_ID || !env.ML_CLIENT_SECRET) return undefined
    const response = await fetchImpl(`${API}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.ML_CLIENT_ID, client_secret: env.ML_CLIENT_SECRET }),
    })
    if (!response.ok) throw new Error(`Falha ao obter token do Mercado Livre (HTTP ${response.status}). Confira ML_CLIENT_ID/ML_CLIENT_SECRET.`)
    token = (await response.json()).access_token
    return token
  }

  async function getJson(path) {
    const accessToken = await getToken()
    const response = await fetchImpl(`${API}${path}`, {
      headers: { accept: 'application/json', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
    })
    if (response.status === 404) return undefined
    if (response.status === 401 || response.status === 403) {
      throw new Error(`API do Mercado Livre recusou a consulta (HTTP ${response.status}). Configure ML_CLIENT_ID e ML_CLIENT_SECRET.`)
    }
    if (!response.ok) throw new Error(`API do Mercado Livre respondeu HTTP ${response.status}.`)
    return response.json()
  }

  /** Segue os redirecionamentos do link curto (meli.la) lendo só o cabeçalho Location, sem baixar páginas. */
  async function resolveRef(entry) {
    if (entry.sourceId) return parseItemRef(`https://x/${entry.sourceId}`) ?? { kind: 'item', id: String(entry.sourceId).toUpperCase() }
    let url = entry.affiliateUrl
    for (let hop = 0; hop < MAX_REDIRECTS && url; hop += 1) {
      const ref = parseItemRef(url)
      if (ref) return ref
      const response = await fetchImpl(url, { method: 'GET', redirect: 'manual', headers: { accept: 'text/html' } })
      const location = response.headers.get('location')
      if (!location) return undefined
      url = new URL(location, url).toString()
    }
    return undefined
  }

  return {
    store: 'mercadolivre',
    canHandle: (entry) => entry.store === 'mercadolivre' || /(^|\/\/)(meli\.la|[^/]*mercadol(i|y)bre?\.[a-z.]+)/i.test(entry.affiliateUrl ?? ''),
    async fetchOffer(entry) {
      const ref = await resolveRef(entry)
      if (!ref) {
        throw new Error('Não consegui descobrir o ID do anúncio pelo link. Adicione "sourceId": "MLB..." a este produto no products.json.')
      }
      if (ref.kind === 'product') {
        const product = await getJson(`/products/${ref.id}`)
        const winner = product?.buy_box_winner
        if (!winner) return { sourceId: ref.id, available: false }
        return {
          sourceId: ref.id,
          price: winner.price,
          originalPrice: winner.original_price ?? undefined,
          available: true,
        }
      }
      const item = await getJson(`/items/${ref.id}`)
      if (!item) return { sourceId: ref.id, available: false }
      if (item.currency_id && item.currency_id !== 'BRL') throw new Error(`Moeda inesperada (${item.currency_id}).`)
      return {
        sourceId: ref.id,
        price: item.price,
        originalPrice: item.original_price ?? undefined,
        available: item.status === 'active' && (item.available_quantity ?? 1) > 0,
      }
    },
  }
}
