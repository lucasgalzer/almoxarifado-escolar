import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RotaProtegida from './routes/RotaProtegida'
import Produtos from './pages/Produtos'
import Pessoas from './pages/Pessoas'
import Estoque from './pages/Estoque'
import Emprestimos from './pages/Emprestimos'
import Solicitacoes from './pages/Solicitacoes'
import Manutencao from './pages/Manutencao'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Usuarios from './pages/Usuarios'
import Solicitante from './pages/Solicitante'
import useAuth from './hooks/useAuth'

function RedirecionarPorPerfil() {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  if (usuario.perfil === 'solicitante') return <Navigate to="/solicitante" />
  return <Navigate to="/dashboard" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/solicitante" element={
          <RotaProtegida perfis={['solicitante']}>
            <Solicitante />
          </RotaProtegida>
        } />
        <Route path="/" element={
          <RotaProtegida perfis={['admin', 'operador']}>
            <Layout />
          </RotaProtegida>
        }>
          <Route index element={<RedirecionarPorPerfil />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="pessoas" element={<Pessoas />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="emprestimos" element={<Emprestimos />} />
          <Route path="solicitacoes" element={<Solicitacoes />} />
          <Route path="manutencao" element={<Manutencao />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App