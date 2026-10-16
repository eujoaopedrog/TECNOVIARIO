import { Link } from 'react-router-dom'

export function BrandLogo() {
  return (
    <Link className="brand" to="/" aria-label="Tecnoviario — página inicial">
      <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="currentColor" />
        <path d="M11 13h18M20 13v15m-7-8h14" fill="none" stroke="white" strokeLinecap="round" strokeWidth="3" />
        <circle cx="12" cy="13" r="2.5" fill="#7dd3fc" />
        <circle cx="28" cy="13" r="2.5" fill="#7dd3fc" />
        <circle cx="13" cy="20" r="2.5" fill="#7dd3fc" />
        <circle cx="27" cy="20" r="2.5" fill="#7dd3fc" />
      </svg>
      <span className="brand-word">tecno<span>viario</span></span>
    </Link>
  )
}
