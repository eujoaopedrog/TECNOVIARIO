// Testes com respostas simuladas (nenhuma chamada real é feita). Rode com: npm run test:prices
import assert from 'node:assert/strict'
import test from 'node:test'
import { createKabumFeedSource, parseMoney } from './price-sources/kabum-feed.mjs'
import { createMercadoLivreSource, parseItemRef } from './price-sources/mercadolivre.mjs'
import { updateCatalog } from './update-prices.mjs'

const NOW = new Date('2026-10-22T12:00:00.000Z')

function fakeFetch(routes) {
  return async (url, init = {}) => {
    const key = String(url)
    const route = routes[key] ?? routes[new URL(key).pathname]
    if (!route) return new Response('not found', { status: 404 })
    if (typeof route === 'function') return route(init)
    return route
  }
}
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

test('parseItemRef entende os formatos de link do Mercado Livre', () => {
  assert.deepEqual(parseItemRef('https://produto.mercadolivre.com.br/MLB-1234567890-ssd-256gb-_JM'), { kind: 'item', id: 'MLB1234567890' })
  assert.deepEqual(parseItemRef('https://www.mercadolivre.com.br/ssd/p/MLB19876543'), { kind: 'product', id: 'MLB19876543' })
  assert.equal(parseItemRef('https://meli.la/2PNnH5G'), undefined)
})

test('Mercado Livre: segue o link curto, lê a API e grava preço, desconto e histórico', async () => {
  const fetchImpl = fakeFetch({
    'https://meli.la/abc': new Response(null, { status: 302, headers: { location: 'https://produto.mercadolivre.com.br/MLB-1111111111-ssd-_JM' } }),
    '/oauth/token': json({ access_token: 'tok' }),
    '/items/MLB1111111111': json({ price: 250, original_price: 320, currency_id: 'BRL', status: 'active', available_quantity: 4 }),
  })
  const source = createMercadoLivreSource({ fetchImpl, env: { ML_CLIENT_ID: 'id', ML_CLIENT_SECRET: 'secret' } })
  const entries = [{ name: 'SSD', affiliateUrl: 'https://meli.la/abc', price: 300, priceHistory: [{ date: '2026-10-21T12:00:00.000Z', price: 300 }] }]
  const { entries: out, report } = await updateCatalog(entries, [source], NOW)
  assert.equal(report.updated.length, 1)
  assert.equal(out[0].price, 250)
  assert.equal(out[0].originalPrice, 320)
  assert.equal(out[0].sourceId, 'MLB1111111111')
  assert.equal(out[0].available, true)
  assert.equal(out[0].lastCheckedAt, NOW.toISOString())
  assert.equal(out[0].priceHistory.length, 2)
  assert.equal(out[0].priceHistory[1].price, 250)
})

test('histórico não repete o mesmo preço dentro de 24 h', async () => {
  const fetchImpl = fakeFetch({ '/items/MLB2': json({ price: 100, currency_id: 'BRL', status: 'active', available_quantity: 1 }) })
  const source = createMercadoLivreSource({ fetchImpl, env: {} })
  const entries = [{ name: 'X', store: 'mercadolivre', sourceId: 'MLB2', priceHistory: [{ date: '2026-10-22T06:00:00.000Z', price: 100 }] }]
  const { entries: out } = await updateCatalog(entries, [source], NOW)
  assert.equal(out[0].priceHistory.length, 1)
})

test('anúncio inexistente ou pausado vira indisponível; falha de API não altera o produto', async () => {
  const fetchImpl = fakeFetch({
    '/items/MLB3': json({ message: 'not found' }, 404),
    '/items/MLB4': json({ price: 50, currency_id: 'BRL', status: 'paused', available_quantity: 0 }),
    '/items/MLB5': json({}, 500),
  })
  const source = createMercadoLivreSource({ fetchImpl, env: {} })
  const base = (sourceId) => ({ name: sourceId, store: 'mercadolivre', sourceId, price: 10, lastCheckedAt: '2026-10-21T00:00:00.000Z' })
  const { entries: out, report } = await updateCatalog([base('MLB3'), base('MLB4'), base('MLB5')], [source], NOW)
  assert.equal(out[0].available, false)
  assert.equal(out[1].available, false)
  assert.equal(report.unavailable.length, 2)
  assert.equal(report.failed.length, 1)
  assert.deepEqual(out[2], base('MLB5')) // intacto
})

test('API recusando (401/403) gera mensagem pedindo as credenciais', async () => {
  const source = createMercadoLivreSource({ fetchImpl: fakeFetch({ '/items/MLB6': json({}, 403) }), env: {} })
  const { report } = await updateCatalog([{ name: 'Y', store: 'mercadolivre', sourceId: 'MLB6' }], [source], NOW)
  assert.match(report.failed[0].reason, /ML_CLIENT_ID/)
})

test('produtos da Amazon são ignorados (continuam manuais)', async () => {
  const source = createMercadoLivreSource({ fetchImpl: fakeFetch({}), env: {} })
  const entry = { name: 'Fonte', affiliateUrl: 'https://link.amazon/B06jU8nFy', price: 266.71 }
  const { entries: out, report } = await updateCatalog([entry], [source], NOW)
  assert.equal(report.skipped.length, 1)
  assert.deepEqual(out[0], entry)
})

test('KaBuM!: lê feed CSV com preços no formato brasileiro', async () => {
  const csv = 'sku;price;old_price;availability\nK1;"1.299,90";"1.599,00";in stock\nK2;99,90;;out of stock\n'
  const source = createKabumFeedSource({ fetchImpl: fakeFetch({ 'https://feed.test/kabum.csv': new Response(csv) }), env: { KABUM_FEED_URL: 'https://feed.test/kabum.csv', KABUM_FEED_COLUMNS: '{"id":"sku"}' } })
  const entries = [
    { name: 'GPU', store: 'kabum', sourceId: 'K1' },
    { name: 'Cabo', store: 'kabum', sourceId: 'K2' },
    { name: 'Sem código', store: 'kabum' },
  ]
  const { entries: out, report } = await updateCatalog(entries, [source], NOW)
  assert.equal(out[0].price, 1299.9)
  assert.equal(out[0].originalPrice, 1599)
  assert.equal(out[1].available, false)
  assert.equal(report.failed.length, 1)
})

test('KaBuM! fica desligada sem KABUM_FEED_URL e parseMoney cobre os formatos', () => {
  assert.equal(createKabumFeedSource({ env: {} }), undefined)
  assert.equal(parseMoney('R$ 5.939,90'), 5939.9)
  assert.equal(parseMoney('5939.90'), 5939.9)
  assert.equal(parseMoney('abc'), undefined)
})
