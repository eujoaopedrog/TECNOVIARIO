import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { SearchBox } from './SearchBox'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuToggle.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="header-main page-shell">
        <BrandLogo />
        <div className="header-search"><SearchBox /></div>
        <nav id="site-navigation" className={`header-nav${menuOpen ? ' header-nav-open' : ''}`} aria-label="Navegação principal">
          <div className="nav-inner">
            <NavLink end to="/ofertas" onClick={() => setMenuOpen(false)}>Ofertas</NavLink>
            <NavLink to="/pesquisa" onClick={() => setMenuOpen(false)}>Pesquisar</NavLink>
            <NavLink className={({ isActive }) => `nav-builder-link${isActive ? ' active' : ''}`} to="/montar-pc" onClick={() => setMenuOpen(false)}>Montar meu PC</NavLink>
            <NavLink to="/guias" onClick={() => setMenuOpen(false)}>Guias</NavLink>
          </div>
        </nav>
        <button
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuToggle}
          type="button"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
