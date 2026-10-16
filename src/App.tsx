import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { GuidesPage } from './pages/GuidesPage'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductPage } from './pages/ProductPage'
import { SearchPage } from './pages/SearchPage'

function ToastListener() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      setMessage(detail)
      window.setTimeout(() => setMessage(''), 3000)
    }
    window.addEventListener('toast', handleToast)
    return () => window.removeEventListener('toast', handleToast)
  }, [])
  return message ? <div className="toast" role="status">{message}</div> : null
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
        <Header />
        <div id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pesquisa" element={<SearchPage />} />
            <Route path="/produto/:slug" element={<ProductPage />} />
            <Route path="/guias" element={<GuidesPage />} />
            <Route path="/guias/:slug" element={<GuidesPage />} />
            <Route path="/sobre" element={<InfoPage />} />
            <Route path="/contato" element={<InfoPage />} />
            <Route path="/privacidade" element={<InfoPage />} />
            <Route path="/afiliados" element={<InfoPage />} />
            <Route path="/termos" element={<InfoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
        <ToastListener />
      </div>
    </BrowserRouter>
  )
}
