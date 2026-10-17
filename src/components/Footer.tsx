import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-main">
          <div className="footer-brand-block">
            <BrandLogo />
            <p>Achadinhos de hardware, com mais transparência.</p>
            <p className="footer-disclosure">O Tecnoviario agrega ofertas de lojas parceiras (Amazon e Mercado Livre). Os preços podem mudar sem aviso. Sempre confirme o valor final na loja.</p>
          </div>
          <div className="footer-links">
            <div><strong>Explore</strong><Link to="/ofertas">Ofertas</Link><Link to="/pesquisa">Pesquisar produtos</Link><Link to="/guias">Guias e comparativos</Link></div>
            <div><strong>Tecnoviario</strong><Link to="/sobre">Sobre</Link><Link to="/contato">Contato</Link><Link to="/afiliados">Aviso de afiliados</Link></div>
            <div><strong>Informações</strong><Link to="/privacidade">Privacidade</Link><Link to="/termos">Termos de uso</Link></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Tecnoviario. Projeto independente.</span>
          <span>Preços e disponibilidade devem ser confirmados na loja.</span>
        </div>
      </div>
    </footer>
  )
}
