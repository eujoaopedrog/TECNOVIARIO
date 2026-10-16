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
      { heading: 'Como trabalhamos', text: 'Organizamos produtos e informações por categorias e especificações. O catálogo desta versão é demonstrativo: seus itens são fictícios e não representam produtos ou ofertas disponíveis.' },
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
      { heading: 'Dados comerciais', text: 'O catálogo atual contém apenas exemplos fictícios e não recebe pedidos, pagamentos ou solicitações de compra.' },
    ],
  },
  '/privacidade': {
    title: 'Política de privacidade',
    description: 'Como o Tecnoviario trata dados nesta versão demonstrativa.',
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
      { heading: 'Estado desta versão', text: 'Este catálogo contém itens fictícios de demonstração. Não há links de afiliados, preços ou ofertas comerciais ativos; os botões de compra permanecem desabilitados para esses itens.' },
      { heading: 'Informações comerciais futuras', text: 'Links, disponibilidade, preços e dados de produtos somente deverão ser publicados quando obtidos de fonte autorizada e mantidos conforme as regras vigentes do programa aplicável.' },
    ],
  },
  '/termos': {
    title: 'Termos de uso',
    description: 'Condições para uso do portal demonstrativo Tecnoviario.',
    lead: 'Ao navegar pelo Tecnoviario, você reconhece que esta versão é um protótipo informativo e não realiza vendas.',
    sections: [
      { heading: 'Catálogo e produtos demonstrativos', text: 'Os itens marcados como demonstração usam nomes e especificações fictícios para testar busca e navegação. Eles não representam produtos reais nem ofertas. Outros produtos só devem ser publicados com dados verificados e origem identificada.' },
      { heading: 'Conteúdo informativo', text: 'Os guias são material geral, não substituem documentação técnica do fabricante nem aconselhamento profissional. Verifique as especificações e a compatibilidade do seu equipamento antes de qualquer intervenção.' },
      { heading: 'Links externos', text: 'Produtos de demonstração não possuem links de compra funcionais. Links adicionados a produtos reais devem ser válidos, autorizados e estar sujeitos às condições e políticas dos respectivos sites.' },
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
