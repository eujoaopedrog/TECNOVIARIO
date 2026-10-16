import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { guides } from '../data/guides'

export function GuidesPage() {
  const { slug } = useParams()
  const guide = slug ? guides.find((item) => item.slug === slug) : undefined

  if (slug && !guide) {
    return <main className="page-shell not-found"><h1>Guia não encontrado</h1><p>Não encontramos esse conteúdo editorial.</p><Link className="button-primary" to="/guias">Ver todos os guias</Link></main>
  }

  if (guide) {
    return (
      <main className="page-shell article-page">
        <PageMeta title={guide.title} description={guide.summary} />
        <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><Link to="/guias">Guias</Link><span>/</span><span>{guide.category}</span></div>
        <Link className="back-link" to="/guias"><ArrowLeft size={16} /> Todos os guias</Link>
        <article>
          <header className="article-header">
            <span className="section-kicker">{guide.category.toUpperCase()} · GUIA PRÁTICO</span>
            <h1>{guide.title}</h1>
            <p>{guide.summary}</p>
            <span className="article-readtime"><Clock3 size={15} /> {guide.readTime}</span>
          </header>
          <div className="article-body">
            <p className="article-intro">{guide.intro}</p>
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              </section>
            ))}
            <aside className="editorial-note"><BookOpen size={19} /><p>Conteúdo editorial independente. Confirme sempre compatibilidade, especificações e condições diretamente com o fabricante ou vendedor antes de comprar.</p></aside>
          </div>
          <div className="article-next"><span>Quer explorar produtos?</span><Link className="text-link" to="/pesquisa">Pesquisar no catálogo <ArrowRight size={16} /></Link></div>
        </article>
      </main>
    )
  }

  return (
    <main className="page-shell guides-page">
      <PageMeta title="Guias e comparativos" description="Guias originais para ajudar a entender componentes e escolher tecnologia com mais confiança." />
      <header className="listing-header"><span className="section-kicker">CONHECIMENTO SEM COMPLICAÇÃO</span><h1>Guias e comparativos</h1><p>Informação prática para você entender as opções e tomar decisões melhores para seu computador e setup.</p></header>
      <div className="guide-list">
        {guides.map((item, index) => (
          <Link className="guide-list-card" key={item.slug} to={`/guias/${item.slug}`}>
            <div className={`guide-list-art guide-card-${(index % 3) + 1}`}><span>0{index + 1}</span><BookOpen size={30} /></div>
            <div className="guide-list-content"><span>{item.category} <i /> <Clock3 size={13} /> {item.readTime}</span><h2>{item.title}</h2><p>{item.summary}</p><strong>Ler guia <ArrowRight size={15} /></strong></div>
          </Link>
        ))}
      </div>
    </main>
  )
}
