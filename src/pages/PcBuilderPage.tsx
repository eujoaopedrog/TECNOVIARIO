import { useMemo, useState } from 'react'
import { ArrowRight, Check, CircleAlert, CircleHelp, ExternalLink, RotateCcw, ShoppingCart, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import {
  checkPcBuild,
  getCompatibilityStatusLabel,
  getPcBuildOptions,
  getPcBuildTotal,
  pcBuildSlots,
  type PcBuildSlotId,
} from '../services/pcBuilderService'
import { getCurrentPrice } from '../services/productService'
import type { Product } from '../types/product'

type PcBuildSelection = Partial<Record<PcBuildSlotId, Product>>

function catalogLink(slotId: PcBuildSlotId): string {
  const categoryBySlot: Partial<Record<PcBuildSlotId, string>> = {
    cpu: 'Processadores',
    motherboard: 'Placas-mãe',
    memory: 'Memórias RAM',
    gpu: 'Placas de vídeo',
    storage: 'SSDs e armazenamento',
    psu: 'Fontes e gabinetes',
    case: 'Fontes e gabinetes',
  }
  const category = categoryBySlot[slotId]
  return category
    ? `/pesquisa?categoria=${encodeURIComponent(category)}`
    : `/pesquisa?q=${encodeURIComponent('cooler')}`
}

function currency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusIcon(status: 'compatible' | 'incompatible' | 'unknown') {
  if (status === 'compatible') return <Check size={16} aria-hidden="true" />
  if (status === 'incompatible') return <CircleAlert size={16} aria-hidden="true" />
  return <CircleHelp size={16} aria-hidden="true" />
}

export function PcBuilderPage() {
  const [selection, setSelection] = useState<PcBuildSelection>({})
  const selectedEntries = useMemo(
    () => pcBuildSlots.flatMap((slot) => {
      const product = selection[slot.id]
      return product ? [{ slot, product }] : []
    }),
    [selection],
  )
  const missingRequired = pcBuildSlots.filter((slot) => slot.required && !selection[slot.id])
  const total = getPcBuildTotal(selection)
  const checks = checkPcBuild(selection)
  const incompatibleCount = checks.filter((check) => check.status === 'incompatible').length
  const unknownCount = checks.filter((check) => check.status === 'unknown').length

  function selectProduct(slotId: PcBuildSlotId, productId: string) {
    const product = getPcBuildOptions(slotId).find((option) => option.id === productId)
    setSelection((current) => {
      const next = { ...current }
      if (product) next[slotId] = product
      else delete next[slotId]
      return next
    })
  }

  function clearBuild() {
    setSelection({})
  }

  const resultHeading = incompatibleCount
    ? 'Há incompatibilidades identificadas'
    : missingRequired.length || unknownCount
      ? 'Montagem incompleta ou compatibilidade não confirmada'
      : checks.length
        ? 'Verificações cadastradas passaram'
        : 'A análise aparece conforme você escolhe as peças'

  return (
    <main className="page-shell pc-builder-page">
      <PageMeta
        title="Monte seu PC"
        description="Monte uma lista de peças, some os preços atuais e confira as verificações de compatibilidade do catálogo Tecnoviario."
        noIndex
      />
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><span>Montar meu PC</span></div>
      <header className="builder-heading">
        <span className="section-kicker"><Wrench size={14} /> MONTADOR DE PC</span>
        <h1>Monte seu PC, peça por peça.</h1>
        <p>Escolha componentes do catálogo, veja o total dos preços atuais e confira o que ainda precisa ser verificado.</p>
      </header>

      <div className="builder-safety-note">
        <CircleHelp size={18} aria-hidden="true" />
        <p><strong>Compatibilidade sem adivinhação.</strong> Esta versão usa regras locais, não IA generativa. Se faltar informação, mostramos “não verificado” — nunca tratamos isso como aprovação. Confira o modelo exato e a lista do fabricante antes de comprar.</p>
      </div>

      <div className="builder-layout">
        <section className="builder-parts" aria-labelledby="builder-parts-title">
          <div className="builder-section-heading">
            <div><span className="section-kicker">SUA MONTAGEM</span><h2 id="builder-parts-title">Escolha as peças</h2></div>
            <button className="builder-reset" type="button" onClick={clearBuild} disabled={!selectedEntries.length}><RotateCcw size={15} /> Limpar</button>
          </div>
          <div className="builder-slot-list">
            {pcBuildSlots.map((slot, index) => {
              const options = getPcBuildOptions(slot.id)
              const selected = selection[slot.id]
              const currentPrice = selected ? getCurrentPrice(selected) : undefined
              return (
                <article className={`builder-slot${selected ? ' builder-slot-selected' : ''}`} key={slot.id}>
                  <div className="builder-slot-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                  <div className="builder-slot-main">
                    <label htmlFor={`slot-${slot.id}`}>
                      <span>{slot.label}</span>
                      <small>{slot.required ? 'Obrigatório' : 'Opcional'}</small>
                    </label>
                    {options.length ? (
                      <select id={`slot-${slot.id}`} value={selected?.id ?? ''} onChange={(event) => selectProduct(slot.id, event.target.value)}>
                        <option value="">Selecione uma peça do catálogo</option>
                        {options.map((product) => {
                          const price = getCurrentPrice(product)
                          return <option value={product.id} key={product.id}>{product.name}{price === undefined ? ' · preço não atualizado' : ` · ${currency(price)}`}</option>
                        })}
                      </select>
                    ) : (
                      <div className="builder-no-options">
                        <span>Nenhum item cadastrado nesta categoria ainda.</span>
                        <Link to={catalogLink(slot.id)}>Ver categoria <ArrowRight size={14} /></Link>
                      </div>
                    )}
                    <p>{slot.hint}</p>
                    {selected && (
                      <div className="builder-selected-item">
                        <Link to={`/produto/${selected.slug}`}>Ver detalhes do produto <ArrowRight size={14} /></Link>
                        {currentPrice === undefined && <span>Preço não atualizado; não incluído no total.</span>}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <aside className="builder-summary" aria-label="Resumo da montagem">
          <section className="builder-total-card">
            <span className="section-kicker"><ShoppingCart size={14} /> RESUMO DA MONTAGEM</span>
            <p className="builder-total-label">Total dos preços atuais</p>
            <strong className="builder-total">{total.pricedCount ? currency(total.total) : '—'}</strong>
            <p className="builder-total-note">
              {!total.selectedCount
                ? 'Selecione peças para calcular o total.'
                : total.pricedCount
                  ? `${total.pricedCount} de ${total.selectedCount} peças selecionadas com preço atualizado.${total.pricedCount !== total.selectedCount ? ' Peças sem preço recente não entram na soma.' : ''}`
                  : 'Nenhuma peça selecionada tem preço atualizado; o total aparecerá quando um preço válido estiver cadastrado.'}
            </p>
          </section>

          <section className="builder-progress-card">
            <h2>O que falta</h2>
            {missingRequired.length ? (
              <ul>
                {missingRequired.map((slot) => <li key={slot.id}><CircleAlert size={15} />{slot.label}</li>)}
              </ul>
            ) : (
              <p className="builder-progress-complete"><Check size={16} /> Todos os componentes essenciais têm uma seleção.</p>
            )}
            <p className="builder-optional-note">Placa de vídeo e cooler são opcionais; confirme se o processador tem vídeo integrado e se já acompanha cooler.</p>
          </section>

          <section className="builder-analysis-card">
            <div className={`builder-analysis-heading${incompatibleCount ? ' has-incompatibility' : unknownCount ? ' has-unknown' : ''}`}>
              {incompatibleCount ? <CircleAlert size={19} /> : unknownCount ? <CircleHelp size={19} /> : <Check size={19} />}
              <h2>{resultHeading}</h2>
            </div>
            {checks.length ? (
              <ul className="compatibility-list">
                {checks.map((check) => (
                  <li className={`compatibility-item compatibility-${check.status}`} key={check.id}>
                    <span>{statusIcon(check.status)}</span>
                    <div><strong>{getCompatibilityStatusLabel(check.status)} · {check.title}</strong><p>{check.message}</p></div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="builder-analysis-empty">Selecione peças relacionadas para ver as verificações disponíveis.</p>
            )}
            <p className="builder-analysis-disclaimer">Mesmo quando as verificações cadastradas passam, outros requisitos (BIOS, dimensões, conectores e revisão do modelo) podem não estar registrados. Isto não é garantia de funcionamento.</p>
          </section>

          <section className="builder-links-card">
            <h2>Links para comprar</h2>
            {selectedEntries.length ? (
              <ul>
                {selectedEntries.map(({ slot, product }) => (
                  <li key={slot.id}>
                    <span>{slot.label}<strong>{product.name}</strong></span>
                    {product.affiliateUrl
                      ? <a href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noreferrer" aria-label={`Comprar ${product.name} na loja`}>Comprar <ExternalLink size={14} /></a>
                      : <span className="builder-no-link">Sem link</span>}
                  </li>
                ))}
              </ul>
            ) : <p>Selecione uma peça para reunir os links de compra aqui.</p>}
          </section>
        </aside>
      </div>
    </main>
  )
}
