import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-main">
          <div className="footer-brand-block">
            <BrandLogo />
            <p>Tecnologia escolhida com inteligência.</p>
            <p className="footer-disclosure">Como associado da Amazon, eu ganho com compras qualificadas.</p>
          </div>
          <div className="footer-links">
            <div><strong>Explore</strong><Link to="/pesquisa">Produtos</Link><Link to="/guias">Guias e comparativos</Link></div>
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
