function useAuth() {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const autenticado = !!token

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return { token, usuario, autenticado, logout }
}

export default useAuth