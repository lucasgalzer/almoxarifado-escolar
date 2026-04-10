import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function RotaProtegida({ children }) {
  const { autenticado } = useAuth()

  if (!autenticado) {
    return <Navigate to="/login" />
  }

  return children
}

export default RotaProtegida