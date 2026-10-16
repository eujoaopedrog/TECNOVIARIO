import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { SearchBox } from './SearchBox'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-main page-shell">
        <BrandLogo />
        <div className="header-search"><SearchBox /></div>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <nav className={`header-nav${menuOpen ? ' header-nav-open' : ''}`} aria-label="Navegação principal">
        <div className="page-shell nav-inner">
          <Link to="/pesquisa?categoria=Processadores" onClick={() => setMenuOpen(false)}>Componentes</Link>
          <Link to="/pesquisa?categoria=Teclados%20e%20mouses" onClick={() => setMenuOpen(false)}>Periféricos</Link>
          <Link to="/pesquisa?categoria=Notebooks%20e%20acess%C3%B3rios" onClick={() => setMenuOpen(false)}>Notebooks</Link>
          <Link to="/guias" onClick={() => setMenuOpen(false)}>Guias e comparativos</Link>
          <span className="nav-note"><span className="status-dot" /> Catálogo independente</span>
        </div>
      </nav>
    </header>
  )
}
