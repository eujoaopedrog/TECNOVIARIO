import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'

export function NotFoundPage() {
  return (
    <main className="page-shell not-found">
      <PageMeta title="Página não encontrada" description="Não encontramos essa página." noIndex />
      <span className="not-found-icon"><SearchX size={35} /></span>
      <span className="section-kicker">ERRO 404</span>
      <h1>Este caminho não existe.</h1>
      <p>Talvez a página tenha mudado de endereço. Volte ao início ou explore o catálogo de produtos.</p>
      <div><Link className="button-primary" to="/">Ir para o início</Link><Link className="text-link" to="/pesquisa"><ArrowLeft size={16} /> Pesquisar produtos</Link></div>
    </main>
  )
}
