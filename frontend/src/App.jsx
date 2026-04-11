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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="pessoas" element={<Pessoas />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="emprestimos" element={<Emprestimos />} />
          <Route path="solicitacoes" element={<Solicitacoes />} />          
          <Route path="manutencao" element={<Manutencao />} />
          <Route path="relatorios" element={<div>Relatórios — em breve</div>} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App