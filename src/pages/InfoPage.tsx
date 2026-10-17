import { Mail, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'

interface InfoContent {
  title: string
  description: string
  lead: string
  sections: { heading: string; text: string }[]
}

const pages: Record<string, InfoContent> = {
  '/sobre': {
    title: 'Sobre o Tecnoviario',
    description: 'Conheça o propósito e os princípios editoriais do Tecnoviario.',
    lead: 'O Tecnoviario é um projeto independente criado para tornar a busca por tecnologia mais clara e ajudar pessoas a entenderem o que estão escolhendo.',
    sections: [
      { heading: 'Como trabalhamos', text: 'Organizamos produtos e informações por categorias e especificações. As informações de cada item devem ser conferidas com os fabricantes ou vendedores e atualizadas quando necessário.' },
      { heading: 'Independência e transparência', text: 'O Tecnoviario não é afiliado, patrocinado nem representa oficialmente a Amazon ou qualquer fabricante. Se links comerciais forem adicionados futuramente, serão identificados com clareza e terão origem autorizada.' },
      { heading: 'Conteúdo editorial', text: 'Os guias procuram explicar critérios e limitações de forma prática. Uma especificação publicada pelo fabricante não equivale a um teste independente nem a uma avaliação de uso.' },
    ],
  },
  '/contato': {
    title: 'Contato',
    description: 'Informações de contato e comunicação com o Tecnoviario.',
    lead: 'Este projeto ainda não configurou um canal público de atendimento. Não envie dados pessoais sensíveis por canais não verificados.',
    sections: [
      { heading: 'Sugestões e correções', text: 'Antes da publicação pública, configure um endereço de contato sob seu domínio e atualize esta página. Assim, leitores poderão comunicar correções editoriais e dúvidas sobre o site.' },
      { heading: 'Dados comerciais', text: 'O Tecnoviario não recebe pedidos nem pagamentos. Compras e condições comerciais são tratadas diretamente pela loja indicada no link do produto.' },
    ],
  },
  '/privacidade': {
    title: 'Política de privacidade',
    description: 'Como o Tecnoviario trata dados neste site.',
    lead: 'Esta versão estática não exige cadastro, não processa pagamentos e não integra ferramentas de publicidade ou análise de audiência.',
    sections: [
      { heading: 'Dados neste navegador', text: 'A pesquisa é executada localmente sobre o catálogo incluído no site. Esta versão não salva histórico, favoritos ou identificadores em armazenamento local.' },
      { heading: 'Hospedagem e registros técnicos', text: 'O provedor de hospedagem pode processar registros técnicos de acesso para operar e proteger o serviço, de acordo com suas próprias políticas. Consulte a política do provedor escolhido.' },
      { heading: 'Cookies e terceiros', text: 'O Tecnoviario não instala cookies próprios de publicidade ou análise nesta versão. Ao acessar futuramente um link externo, o tratamento de dados será regido pelo destino e suas políticas.' },
      { heading: 'Alterações', text: 'Esta política deverá ser revisada quando forem adicionadas funcionalidades, ferramentas de análise, armazenamento local ou integrações comerciais.' },
    ],
  },
  '/afiliados': {
    title: 'Aviso de afiliados',
    description: 'Transparência sobre links de afiliados e a natureza independente do Tecnoviario.',
    lead: 'Como associado da Amazon, eu ganho com compras qualificadas.',
    sections: [
      { heading: 'Projeto independente', text: 'O Tecnoviario é um site independente e não é patrocinado, endossado ou operado pela Amazon. A menção ao programa não implica parceria institucional além da participação formal, caso configurada.' },
      { heading: 'Links de afiliados', text: 'Alguns links de produtos podem ser links de afiliados. Se você comprar por meio deles, o Tecnoviario pode receber uma comissão, sem custo adicional para você.' },
      { heading: 'Informações comerciais', text: 'Preço, disponibilidade e dados de produtos devem ter origem autorizada, ser atualizados de acordo com as regras do programa aplicável e ser confirmados na página da loja antes da compra.' },
    ],
  },
  '/termos': {
    title: 'Termos de uso',
    description: 'Condições para uso do portal Tecnoviario.',
    lead: 'O Tecnoviario é um portal informativo independente. As compras são concluídas exclusivamente nas lojas externas indicadas.',
    sections: [
      { heading: 'Informações do catálogo', text: 'As descrições e especificações são informativas. Confirme compatibilidade, preço, disponibilidade e condições diretamente com o fabricante ou a loja antes de comprar.' },
      { heading: 'Conteúdo informativo', text: 'Os guias são material geral, não substituem documentação técnica do fabricante nem aconselhamento profissional. Verifique as especificações e a compatibilidade do seu equipamento antes de qualquer intervenção.' },
      { heading: 'Links externos', text: 'Ao seguir um link, você acessa um site de terceiros, sujeito aos próprios termos, políticas, preços e condições. O Tecnoviario não processa pagamentos nem conclui compras.' },
    ],
  },
}

export function InfoPage() {
  const { pathname } = useLocation()
  const page = pages[pathname] ?? pages['/sobre']
  return (
    <main className="page-shell info-page">
      <PageMeta title={page.title} description={page.description} />
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><span>{page.title}</span></div>
      <header className="info-header"><span className="section-kicker">TECNOVIARIO</span><h1>{page.title}</h1><p>{page.lead}</p></header>
      {pathname === '/afiliados' && <div className="info-highlight"><ShieldCheck size={20} /><strong>Como associado da Amazon, eu ganho com compras qualificadas.</strong></div>}
      {pathname === '/contato' && <div className="info-highlight"><Mail size={20} /><span>O responsável pelo projeto deve cadastrar um canal válido antes de divulgar o site ao público.</span></div>}
      <div className="info-sections">
        {page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}
      </div>
    </main>
  )
}
