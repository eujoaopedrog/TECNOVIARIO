import { products } from '../data/products'
import { getCurrentPrice } from './productService'
import type { Product } from '../types/product'

export type PcBuildSlotId = 'cpu' | 'motherboard' | 'memory' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooler'
export type CompatibilityStatus = 'compatible' | 'incompatible' | 'unknown'

export interface PcBuildSlot {
  id: PcBuildSlotId
  label: string
  required: boolean
  hint: string
}

export interface CompatibilityCheck {
  id: string
  title: string
  status: CompatibilityStatus
  message: string
}

export const pcBuildSlots: PcBuildSlot[] = [
  { id: 'cpu', label: 'Processador', required: true, hint: 'Escolha a CPU para sua montagem.' },
  { id: 'motherboard', label: 'Placa-mãe', required: true, hint: 'O soquete e o suporte de memória precisam combinar com as peças.' },
  { id: 'memory', label: 'Memória RAM', required: true, hint: 'DDR e capacidade devem ser conferidas na placa-mãe.' },
  { id: 'gpu', label: 'Placa de vídeo', required: false, hint: 'Opcional se o processador tiver vídeo integrado.' },
  { id: 'storage', label: 'Armazenamento', required: true, hint: 'SSD, HD ou outro armazenamento disponível no catálogo.' },
  { id: 'psu', label: 'Fonte de alimentação', required: true, hint: 'Potência suficiente precisa ser confirmada para o conjunto.' },
  { id: 'case', label: 'Gabinete', required: true, hint: 'Confira se o gabinete aceita o formato da placa-mãe.' },
  { id: 'cooler', label: 'Cooler do processador', required: false, hint: 'Confirme se acompanha o processador ou escolha um compatível.' },
]

function normalized(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '')
}

function normalizedSocket(value: string): string {
  const socket = normalized(value).replace(/^(socket|soquetedecpu|soquete)/, '')
  return socket.match(/(?:am\d+|lga\d+)/)?.[0] ?? socket
}

function normalizedMemoryType(value: string): string {
  return normalized(value).match(/ddr[2345]/)?.[0] ?? normalized(value)
}

function normalizedFormFactor(value: string): string {
  const formFactor = normalized(value)
  if (['microatx', 'matx'].includes(formFactor)) return 'matx'
  if (['miniatx', 'miniitx'].includes(formFactor)) return 'miniitx'
  if (['extendedatx', 'eatx'].includes(formFactor)) return 'eatx'
  return formFactor
}

function productDetailsText(product: Product): string {
  return normalized([
    product.name,
    product.model,
    ...Object.entries(product.specifications).flat(),
  ].join(' '))
}

function isPowerSupply(product: Product): boolean {
  const category = normalized(product.category)
  return Boolean(product.compatibility?.psuWattage)
    || /fonte|powersupply|psu/.test(productDetailsText(product))
    || ['fonte', 'fontes', 'fontedealimentacao', 'fontesdealimentacao'].includes(category)
}

function isCase(product: Product): boolean {
  return Boolean(product.compatibility?.supportedFormFactors)
    || /gabinete|computercase/.test(productDetailsText(product))
}

export function getPcBuildOptions(slotId: PcBuildSlotId): Product[] {
  const byCategory = (category: string) => products.filter((product) => product.category === category)
  switch (slotId) {
    case 'cpu':
      return byCategory('Processadores')
    case 'motherboard':
      return byCategory('Placas-mãe')
    case 'memory':
      return byCategory('Memórias RAM')
    case 'gpu':
      return byCategory('Placas de vídeo')
    case 'storage':
      return products.filter((product) =>
        /armazenamento|ssd|hd/.test(normalized(product.category)),
      )
    case 'psu':
      return products.filter(isPowerSupply)
    case 'case':
      return products.filter(isCase)
    case 'cooler':
      return products.filter((product) =>
        /cooler|refrigeracao/.test(normalized(product.category)),
      )
  }
}

function compareValues(
  title: string,
  leftName: string,
  leftValue: string | undefined,
  rightName: string,
  rightValue: string | undefined,
  formatValues: (left: string, right: string) => boolean,
): CompatibilityCheck {
  if (!leftValue || !rightValue) {
    return {
      id: title,
      title,
      status: 'unknown',
      message: `Não verificado: informe os dados técnicos de ${leftName} e ${rightName}.`,
    }
  }
  const matches = formatValues(normalized(leftValue), normalized(rightValue))
  return {
    id: title,
    title,
    status: matches ? 'compatible' : 'incompatible',
    message: matches
      ? `${leftName}: ${leftValue} · ${rightName}: ${rightValue}.`
      : `${leftName}: ${leftValue} não corresponde a ${rightName}: ${rightValue}.`,
  }
}

function socketFor(product: Product | undefined): string | undefined {
  return product?.compatibility?.socket
}

function memoryCheck(
  motherboard: Product | undefined,
  memory: Product | undefined,
): CompatibilityCheck {
  if (!motherboard || !memory) {
    return {
      id: 'memory',
      title: 'Memória e placa-mãe',
      status: 'unknown',
      message: 'Selecione a memória RAM e a placa-mãe para verificar o padrão DDR.',
    }
  }
  const supportedTypes = motherboard.compatibility?.supportedMemoryTypes
  const memoryType = memory.compatibility?.memoryType
  if (!supportedTypes?.length || !memoryType) {
    return {
      id: 'memory',
      title: 'Memória e placa-mãe',
      status: 'unknown',
      message: 'Não verificado: informe o tipo DDR da memória e os tipos aceitos pela placa-mãe.',
    }
  }
  const compatible = supportedTypes.some((type) => normalizedMemoryType(type) === normalizedMemoryType(memoryType))
  return {
    id: 'memory',
    title: 'Memória e placa-mãe',
    status: compatible ? 'compatible' : 'incompatible',
    message: compatible
      ? `A placa-mãe informa suporte a ${memoryType}.`
      : `A memória é ${memoryType}; a placa-mãe informa suporte a ${supportedTypes.join(', ')}.`,
  }
}

function formFactorCheck(
  motherboard: Product | undefined,
  computerCase: Product | undefined,
): CompatibilityCheck {
  if (!motherboard || !computerCase) {
    return {
      id: 'case',
      title: 'Placa-mãe e gabinete',
      status: 'unknown',
      message: 'Selecione a placa-mãe e o gabinete para verificar o formato físico.',
    }
  }
  const formFactor = motherboard.compatibility?.formFactor
  const supportedFormFactors = computerCase.compatibility?.supportedFormFactors
  if (!formFactor || !supportedFormFactors?.length) {
    return {
      id: 'case',
      title: 'Placa-mãe e gabinete',
      status: 'unknown',
      message: 'Não verificado: informe o formato da placa-mãe e os formatos aceitos pelo gabinete.',
    }
  }
  const compatible = supportedFormFactors.some((supported) => normalizedFormFactor(supported) === normalizedFormFactor(formFactor))
  return {
    id: 'case',
    title: 'Placa-mãe e gabinete',
    status: compatible ? 'compatible' : 'incompatible',
    message: compatible
      ? `O gabinete informa suporte a ${formFactor}.`
      : `A placa-mãe é ${formFactor}; o gabinete informa suporte a ${supportedFormFactors.join(', ')}.`,
  }
}

function storageCheck(
  motherboard: Product | undefined,
  storage: Product | undefined,
): CompatibilityCheck {
  if (!motherboard || !storage) {
    return {
      id: 'storage',
      title: 'Armazenamento e placa-mãe',
      status: 'unknown',
      message: 'Selecione o armazenamento e a placa-mãe para verificar a interface.',
    }
  }
  const storageInterface = storage.compatibility?.storageInterface
  const supportedInterfaces = motherboard.compatibility?.supportedStorageInterfaces
  if (!storageInterface || !supportedInterfaces?.length) {
    return {
      id: 'storage',
      title: 'Armazenamento e placa-mãe',
      status: 'unknown',
      message: 'Não verificado: informe a interface do armazenamento e as interfaces aceitas pela placa-mãe.',
    }
  }
  const compatible = supportedInterfaces.some((supported) =>
    normalized(storageInterface).includes(normalized(supported))
      || normalized(supported).includes(normalized(storageInterface)),
  )
  return {
    id: 'storage',
    title: 'Armazenamento e placa-mãe',
    status: compatible ? 'compatible' : 'incompatible',
    message: compatible
      ? `A placa-mãe informa suporte a ${storageInterface}.`
      : `O armazenamento usa ${storageInterface}; a placa-mãe informa suporte a ${supportedInterfaces.join(', ')}.`,
  }
}

function powerCheck(
  psu: Product | undefined,
  gpu: Product | undefined,
): CompatibilityCheck {
  if (!psu || !gpu) {
    return {
      id: 'power',
      title: 'Fonte e placa de vídeo',
      status: 'unknown',
      message: 'Selecione a fonte e a placa de vídeo para conferir a potência mínima recomendada.',
    }
  }
  const psuWattage = psu.compatibility?.psuWattage
  const minimumPsuWatts = gpu.compatibility?.minimumPsuWatts
  if (!psuWattage || !minimumPsuWatts) {
    return {
      id: 'power',
      title: 'Potência recomendada',
      status: 'unknown',
      message: 'Não verificado: informe a potência da fonte e o mínimo recomendado pelo fabricante da placa de vídeo.',
    }
  }
  const compatible = psuWattage >= minimumPsuWatts
  return {
    id: 'power',
    title: 'Potência recomendada',
    status: compatible ? 'compatible' : 'incompatible',
    message: compatible
      ? `Fonte de ${psuWattage} W; mínimo informado pela placa de vídeo: ${minimumPsuWatts} W.`
      : `A fonte fornece ${psuWattage} W, abaixo do mínimo de ${minimumPsuWatts} W informado pela placa de vídeo.`,
  }
}

function graphicsCheck(
  cpu: Product | undefined,
  gpu: Product | undefined,
): CompatibilityCheck {
  if (gpu) {
    return {
      id: 'graphics',
      title: 'Saída de vídeo',
      status: 'unknown',
      message: 'A placa de vídeo foi selecionada; conexões, dimensões e alimentação ainda precisam ser conferidas.',
    }
  }
  if (!cpu) {
    return {
      id: 'graphics',
      title: 'Saída de vídeo',
      status: 'unknown',
      message: 'Selecione um processador ou uma placa de vídeo para verificar a saída de imagem.',
    }
  }
  const integratedGraphics = cpu.compatibility?.integratedGraphics
  if (integratedGraphics === true) {
    return {
      id: 'graphics',
      title: 'Saída de vídeo',
      status: 'unknown',
      message: 'O catálogo informa vídeo integrado no processador, mas a saída de vídeo da placa-mãe ainda precisa ser conferida.',
    }
  }
  if (integratedGraphics === false) {
    return {
      id: 'graphics',
      title: 'Saída de vídeo',
      status: 'incompatible',
      message: 'Este processador foi marcado sem vídeo integrado; adicione uma placa de vídeo.',
    }
  }
  return {
    id: 'graphics',
    title: 'Saída de vídeo',
    status: 'unknown',
    message: 'Não verificado: informe se o processador tem vídeo integrado ou adicione uma placa de vídeo.',
  }
}

export function checkPcBuild(
  selection: Partial<Record<PcBuildSlotId, Product>>,
): CompatibilityCheck[] {
  const cpuSocket = socketFor(selection.cpu)
  const motherboardSocket = socketFor(selection.motherboard)
  const socketCheck = selection.cpu && selection.motherboard
    ? compareValues(
      'socket',
      'Processador',
      cpuSocket,
      'placa-mãe',
      motherboardSocket,
      (left, right) => normalizedSocket(left) === normalizedSocket(right),
    )
    : {
      id: 'socket',
      title: 'Soquete do processador',
      status: 'unknown' as const,
      message: 'Selecione processador e placa-mãe para verificar o soquete.',
    }

  return [
    ...(selection.cpu && selection.motherboard ? [{ ...socketCheck, title: 'Processador e placa-mãe' }] : []),
    ...(selection.motherboard && selection.memory ? [memoryCheck(selection.motherboard, selection.memory)] : []),
    ...(selection.motherboard && selection.case ? [formFactorCheck(selection.motherboard, selection.case)] : []),
    ...(selection.motherboard && selection.storage ? [storageCheck(selection.motherboard, selection.storage)] : []),
    ...(selection.psu && selection.gpu ? [powerCheck(selection.psu, selection.gpu)] : []),
    ...(selection.cpu ? [graphicsCheck(selection.cpu, selection.gpu)] : []),
  ]
}

export function getPcBuildTotal(selection: Partial<Record<PcBuildSlotId, Product>>): {
  total: number
  pricedCount: number
  selectedCount: number
} {
  const selected = Object.values(selection).filter((product): product is Product => product !== undefined)
  const prices = selected.map((product) => getCurrentPrice(product)).filter((price): price is number => price !== undefined)
  return {
    total: prices.reduce((sum, price) => sum + price, 0),
    pricedCount: prices.length,
    selectedCount: selected.length,
  }
}

export function getCompatibilityStatusLabel(status: CompatibilityStatus): string {
  switch (status) {
    case 'compatible':
      return 'Compatível'
    case 'incompatible':
      return 'Incompatível'
    case 'unknown':
      return 'Não verificado'
  }
}
