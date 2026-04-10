import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RotaProtegida from './routes/RotaProtegida'
import Produtos from './pages/Produtos'

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
          <Route path="pessoas" element={<div>Pessoas — em breve</div>} />
          <Route path="estoque" element={<div>Estoque — em breve</div>} />
          <Route path="emprestimos" element={<div>Empréstimos — em breve</div>} />
          <Route path="solicitacoes" element={<div>Solicitações — em breve</div>} />
          <Route path="manutencao" element={<div>Manutenção — em breve</div>} />
          <Route path="relatorios" element={<div>Relatórios — em breve</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App