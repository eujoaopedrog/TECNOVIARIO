import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = path.join(projectRoot, 'src', 'data', 'products.json')
const imagesDirectory = path.join(projectRoot, 'public', 'products', 'images')
const adminPagePath = path.join(projectRoot, 'scripts', 'product-admin.html')
const host = '127.0.0.1'
const port = 4179
const maxRequestBytes = 12 * 1024 * 1024
const maxImageBytes = 8 * 1024 * 1024
const adminToken = randomBytes(32).toString('hex')
const imageTypes = {
  'image/jpeg': { extension: '.jpg', signature: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  'image/png': { extension: '.png', signature: (bytes) => bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: '.webp', signature: (bytes) => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' },
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(payload))
}

function createSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function rejectInput(message, statusCode = 400) {
  const error = new Error(message)
  error.name = 'ProductInputError'
  error.statusCode = statusCode
  throw error
}

function parsePrice(value) {
  if (typeof value === 'number') {
    if (
      !Number.isFinite(value)
      || value < 0
      || !Number.isSafeInteger(Math.round(value * 100))
      || Math.round(value * 100) / 100 !== value
    ) {
      rejectInput('Informe um preço válido, igual ou maior que zero, com no máximo duas casas decimais.')
    }
    return value
  }

  if (typeof value !== 'string') {
    rejectInput('Informe o preço no formato 5.939,90.')
  }

  let input = value.trim().replace(/^R\$\s*/i, '').replace(/[\s\u00a0\u202f]/g, '')
  if (!input) return undefined

  if (!/^\d+(?:[.,]\d+)*$/.test(input)) {
    rejectInput('Preço inválido. Use, por exemplo, 5.939,90 ou 5939,90.')
  }

  const lastComma = input.lastIndexOf(',')
  const lastDot = input.lastIndexOf('.')
  let decimalSeparator
  let groupingSeparator

  if (lastComma !== -1 && lastDot !== -1) {
    decimalSeparator = lastComma > lastDot ? ',' : '.'
    groupingSeparator = decimalSeparator === ',' ? '.' : ','
  } else {
    const separator = lastComma === -1 ? (lastDot === -1 ? undefined : '.') : ','
    if (!separator) {
      const integer = Number(input)
      if (!Number.isFinite(integer) || !Number.isSafeInteger(integer * 100)) {
        rejectInput('O preço é grande demais para ser salvo com precisão de centavos.')
      }
      return integer
    }

    const occurrences = [...input].filter((character) => character === separator).length
    const trailingDigits = input.length - input.lastIndexOf(separator) - 1
    if (occurrences > 1) {
      groupingSeparator = separator
    } else if (trailingDigits === 3 && input.slice(0, input.lastIndexOf(separator)).length <= 3) {
      groupingSeparator = separator
    } else {
      decimalSeparator = separator
    }
  }

  const parts = decimalSeparator ? input.split(decimalSeparator) : [input]
  if (parts.length > 2) rejectInput('Preço inválido. Confira os separadores de milhar e centavos.')
  const [integerPart, decimalPart = ''] = parts
  if (decimalPart.length > 2) rejectInput('O preço pode ter no máximo duas casas decimais.')

  let integerDigits = integerPart
  if (groupingSeparator) {
    const groups = integerPart.split(groupingSeparator)
    if (
      groups.length < 2
      || !/^\d{1,3}$/.test(groups[0])
      || groups.slice(1).some((group) => !/^\d{3}$/.test(group))
    ) {
      rejectInput('Separador de milhar inválido. Use, por exemplo, 5.939,90.')
    }
    integerDigits = groups.join('')
  }

  if (!/^\d+$/.test(integerDigits) || (decimalPart && !/^\d+$/.test(decimalPart))) {
    rejectInput('Preço inválido. Use, por exemplo, 5.939,90.')
  }

  const cents = Number(decimalPart.padEnd(2, '0') || '0')
  const totalCents = Number(integerDigits) * 100 + cents
  if (!Number.isSafeInteger(totalCents)) {
    rejectInput('O preço é grande demais para ser salvo com precisão de centavos.')
  }
  return totalCents / 100
}

function detectStore(url) {
  if (!url) return undefined
  const hostName = new URL(url).hostname.toLowerCase()
  if (['amazon.com.br', 'link.amazon', 'amzn.to'].includes(hostName) || hostName.endsWith('.amazon.com.br') || hostName === 'amazon.com' || hostName.endsWith('.amazon.com')) return 'amazon'
  if (['meli.la', 'mercadolivre.com.br', 'mercadolibre.com'].includes(hostName) || hostName.endsWith('.mercadolivre.com.br') || hostName.endsWith('.mercadolibre.com')) return 'mercadolivre'
  return undefined
}

function parsePriceHistory(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const points = []
  for (const line of value.split(/\r?\n/)) {
    const separator = line.indexOf(';')
    if (separator < 1) rejectInput('Histórico inválido. Use uma linha por registro no formato data ISO; preço.')
    const date = line.slice(0, separator).trim()
    const timestamp = Date.parse(date)
    if (!Number.isFinite(timestamp) || timestamp > Date.now()) rejectInput('Cada data do histórico precisa ser válida e não pode estar no futuro.')
    const price = parsePrice(line.slice(separator + 1))
    if (price === undefined) rejectInput('Informe um preço para cada ponto do histórico.')
    points.push({ date: new Date(timestamp).toISOString(), price })
  }
  points.sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
  return points.length ? points : undefined
}

async function readCatalog() {
  const content = await readFile(catalogPath, 'utf8')
  const catalog = JSON.parse(content)
  if (!Array.isArray(catalog)) throw new Error('O catálogo precisa ser uma lista de produtos.')
  return catalog
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > maxRequestBytes) {
        reject(new Error('O envio ultrapassou o limite permitido de 12 MB.'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function optionalText(value, label) {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || value.trim().length > 60) {
    rejectInput(`${label} deve ter até 60 caracteres.`)
  }
  return value.trim()
}

function optionalList(value, label) {
  const text = optionalText(value, label)
  return text ? [...new Set(text.split(',').map((item) => item.trim()).filter(Boolean))] : undefined
}

function optionalPositiveNumber(value, label) {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0 || number > 20000) {
    rejectInput(`${label} precisa ser um número maior que zero.`)
  }
  return number
}

function parseCompatibility(input) {
  const values = {
    socket: optionalText(input.socket, 'Soquete'),
    memoryType: optionalText(input.memoryType, 'Tipo de memória'),
    supportedMemoryTypes: optionalList(input.supportedMemoryTypes, 'Memórias suportadas'),
    formFactor: optionalText(input.formFactor, 'Formato'),
    supportedFormFactors: optionalList(input.supportedFormFactors, 'Formatos suportados'),
    storageInterface: optionalText(input.storageInterface, 'Interface de armazenamento'),
    supportedStorageInterfaces: optionalList(input.supportedStorageInterfaces, 'Interfaces de armazenamento suportadas'),
    psuWattage: optionalPositiveNumber(input.psuWattage, 'Potência da fonte'),
    minimumPsuWatts: optionalPositiveNumber(input.minimumPsuWatts, 'Potência mínima recomendada da fonte'),
    integratedGraphics: input.integratedGraphics === 'yes' ? true : input.integratedGraphics === 'no' ? false : undefined,
  }
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined))
}

async function addProduct(productInput) {
  const name = typeof productInput.name === 'string' ? productInput.name.trim() : ''
  const category = typeof productInput.category === 'string' ? productInput.category.trim() : ''
  const brand = typeof productInput.brand === 'string' ? productInput.brand.trim() : ''
  const model = typeof productInput.model === 'string' ? productInput.model.trim() : ''
  const description = typeof productInput.description === 'string' ? productInput.description.trim() : ''
  const editorialAssessment = typeof productInput.editorialAssessment === 'string' ? productInput.editorialAssessment.trim() : ''
  const affiliateUrl = typeof productInput.affiliateUrl === 'string' ? productInput.affiliateUrl.trim() : ''
  const requestedStore = productInput.store === 'amazon' || productInput.store === 'mercadolivre' ? productInput.store : undefined
  const dataSource = typeof productInput.dataSource === 'string' ? productInput.dataSource.trim() : ''
  const compatibility = parseCompatibility(productInput)

  if (!name || !category) rejectInput('Preencha o nome e a categoria do produto.')
  const slug = createSlug(name)
  if (!slug) rejectInput('O nome precisa conter letras ou números.')

  if (affiliateUrl) {
    let parsedUrl
    try {
      parsedUrl = new URL(affiliateUrl)
    } catch {
      rejectInput('O link da loja não é válido.')
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      rejectInput('O link da loja precisa começar com http:// ou https://.')
    }
  }

  const price = parsePrice(productInput.price)
  const originalPrice = parsePrice(productInput.originalPrice)
  const detectedStore = affiliateUrl ? detectStore(affiliateUrl) : undefined
  if (requestedStore && detectedStore && requestedStore !== detectedStore) {
    rejectInput('A loja selecionada não corresponde ao domínio do link informado.')
  }
  const store = requestedStore || detectedStore
  const rawLastCheckedAt = typeof productInput.lastCheckedAt === 'string' ? productInput.lastCheckedAt.trim() : ''
  const parsedLastCheckedAt = rawLastCheckedAt ? Date.parse(rawLastCheckedAt) : Number.NaN
  if (rawLastCheckedAt && (!Number.isFinite(parsedLastCheckedAt) || parsedLastCheckedAt > Date.now())) {
    rejectInput('A data de verificação precisa ser válida e não pode estar no futuro.')
  }
  const lastCheckedAt = rawLastCheckedAt
    ? new Date(parsedLastCheckedAt).toISOString()
    : price !== undefined
      ? new Date().toISOString()
      : undefined
  const dealTags = new Set(['menor-preco-30d', 'acabou-de-cair', 'em-alta', 'novo'])
  const dealTag = dealTags.has(productInput.dealTag) ? productInput.dealTag : undefined
  const priceHistory = parsePriceHistory(productInput.priceHistory)
  const available = productInput.available === 'true' ? true : productInput.available === 'false' ? false : undefined

  const specifications = {}
  if (typeof productInput.specifications === 'string' && productInput.specifications.trim()) {
    let detailNumber = 0
    for (const line of productInput.specifications.split(/\r?\n/)) {
      const value = line.trim().replace(/^[-*]\s+/, '')
      if (!value) continue
      const separator = value.indexOf(':')
      if (separator > 0 && value.slice(separator + 1).trim()) {
        specifications[value.slice(0, separator).trim()] = value.slice(separator + 1).trim()
      } else {
        detailNumber += 1
        specifications[`Detalhe ${detailNumber}`] = value
      }
    }
  }

  const image = productInput.image
  let imageBuffer
  let imageExtension
  if (image !== undefined && image !== null) {
    if (typeof image.data !== 'string' || typeof image.type !== 'string') {
      rejectInput('O arquivo de imagem enviado é inválido.')
    }
    const imageType = imageTypes[image.type]
    if (!imageType) rejectInput('A imagem precisa estar no formato JPG, PNG ou WebP.')
    imageBuffer = Buffer.from(image.data, 'base64')
    if (!imageBuffer.length || imageBuffer.length > maxImageBytes) {
      rejectInput('A imagem precisa ter no máximo 8 MB.')
    }
    if (!imageType.signature(imageBuffer)) rejectInput('O conteúdo do arquivo não corresponde ao formato da imagem.')
    imageExtension = imageType.extension
  }

  const catalog = await readCatalog()
  if (catalog.some((entry) => createSlug(String(entry.name ?? '')) === slug)) {
    rejectInput('Já existe um produto com esse nome. Confira o catálogo antes de cadastrar novamente.', 409)
  }

  const product = {
    name,
    category,
    ...(brand ? { brand } : {}),
    ...(model ? { model } : {}),
    ...(description ? { description } : {}),
    ...(editorialAssessment ? { editorialAssessment } : {}),
    ...(Object.keys(specifications).length ? { specifications } : {}),
    ...(Object.keys(compatibility).length ? { compatibility } : {}),
    ...(imageBuffer ? { image: '' } : {}),
    ...(affiliateUrl ? { affiliateUrl } : {}),
    ...(price !== undefined ? { price, priceUpdatedAt: lastCheckedAt } : {}),
    ...(originalPrice !== undefined ? { originalPrice } : {}),
    ...(store ? { store } : {}),
    ...(lastCheckedAt ? { lastCheckedAt } : {}),
    ...(priceHistory ? { priceHistory } : {}),
    ...(available !== undefined ? { available } : {}),
    ...(dealTag ? { dealTag } : {}),
    dataSource: dataSource || 'Informado manualmente pelo editor',
  }

  let imagePath
  if (imageBuffer) {
    await mkdir(imagesDirectory, { recursive: true })
    let filename = `${slug}${imageExtension}`
    let suffix = 2
    while (true) {
      try {
        await access(path.join(imagesDirectory, filename), constants.F_OK)
        filename = `${slug}-${suffix}${imageExtension}`
        suffix += 1
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
        break
      }
    }
    imagePath = path.join(imagesDirectory, filename)
    product.image = `/products/images/${filename}`
    await writeFile(imagePath, imageBuffer, { flag: 'wx' })
  }

  const updatedCatalog = [...catalog, product]
  const temporaryCatalogPath = `${catalogPath}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`
  try {
    await writeFile(temporaryCatalogPath, `${JSON.stringify(updatedCatalog, null, 2)}\n`, { flag: 'wx' })
    await rename(temporaryCatalogPath, catalogPath)
  } catch (error) {
    await rm(temporaryCatalogPath, { force: true })
    if (imagePath) await rm(imagePath, { force: true })
    throw error
  }
  return product
}

const server = createServer(async (request, response) => {
  if (request.headers.host !== `${host}:${port}`) {
    response.writeHead(403)
    response.end('Acesso permitido somente pelo endereço local exibido no terminal.')
    return
  }

  const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`)
  if (request.method === 'GET' && requestUrl.pathname === '/') {
    try {
      const html = await readFile(adminPagePath, 'utf8')
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': `default-src 'self'; img-src 'self' blob: data:; style-src 'unsafe-inline'; script-src 'nonce-${adminToken}'`,
      })
      response.end(html.replaceAll('__ADMIN_TOKEN__', adminToken))
    } catch (error) {
      console.error('Não foi possível carregar a página de cadastro.', error)
      sendJson(response, 500, { error: 'Não foi possível abrir a página de cadastro.' })
    }
    return
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/categories') {
    try {
      const catalog = await readCatalog()
      const categories = [...new Set(catalog.map((entry) => entry.category).filter((value) => typeof value === 'string'))]
      sendJson(response, 200, { categories, productCount: catalog.length })
    } catch (error) {
      console.error('Não foi possível ler o catálogo de produtos.', error)
      sendJson(response, 500, { error: 'Não foi possível ler o catálogo de produtos.' })
    }
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/products') {
    const origin = request.headers.origin
    const token = request.headers['x-admin-token']
    if (origin !== `http://${host}:${port}` || typeof token !== 'string' || !safeEqual(token, adminToken)) {
      sendJson(response, 403, { error: 'A sessão de cadastro expirou ou não é válida. Reabra a página local.' })
      return
    }
    try {
      const body = await readRequestBody(request)
      const product = await addProduct(JSON.parse(body))
      sendJson(response, 201, { product })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o produto.'
      if (error instanceof SyntaxError || error.name === 'ProductInputError') {
        sendJson(response, error.statusCode ?? 400, { error: message })
      } else {
        console.error('Erro ao salvar o produto no catálogo.', error)
        sendJson(response, 500, { error: 'Ocorreu um erro ao salvar o produto. Confira o catálogo e as permissões da pasta.' })
      }
    }
    return
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Não encontrado.')
})

server.on('error', (error) => {
  console.error(`Não foi possível iniciar a ferramenta local em http://${host}:${port}.`, error)
  process.exitCode = 1
})

server.listen(port, host, () => {
  console.log(`Cadastro de produtos: http://${host}:${port}`)
  console.log('Mantenha esta janela do terminal aberta enquanto cadastra produtos. Pressione Ctrl+C para encerrar.')
})
