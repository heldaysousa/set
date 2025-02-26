import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { LoginPage } from './pages/auth/Login'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { ThemeProvider } from '@/components/theme-provider'
import { AppLayout } from '@/components/layout/AppLayout'
import { useMockDataStore } from '@/stores/mockDataStore'
import { Agenda } from '@/pages/agenda'
import { Clientes } from '@/pages/clientes'
import { Servicos } from '@/pages/servicos'
import { Financeiro } from '@/pages/financeiro'
import { Configuracoes } from '@/pages/configuracoes'
import { CommissionsPage } from '@/features/commission/pages/CommissionsPage'

export default function App() {
  const { initialize: initAuth } = useAuthStore()
  const { initialize: initMock } = useMockDataStore()

  useEffect(() => {
    initAuth()
    initMock()
  }, [initAuth, initMock])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ceo-express-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="servicos" element={<Servicos />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="financeiro/comissoes" element={<CommissionsPage />} />
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
