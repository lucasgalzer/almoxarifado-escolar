import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, Archive,
  ArrowLeftRight, ClipboardList, Wrench,
  BarChart2, Settings, LogOut, Menu, X, Box
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import styles from './Layout.module.css'

const menuItems = [
  { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/produtos',      label: 'Produtos',       icon: Package },
  { path: '/pessoas',       label: 'Pessoas',        icon: Users },
  { path: '/estoque',       label: 'Estoque',        icon: Archive },
  { path: '/emprestimos',   label: 'Empréstimos',    icon: ArrowLeftRight },
  { path: '/solicitacoes',  label: 'Solicitações',   icon: ClipboardList },
  { path: '/manutencao',    label: 'Manutenção',     icon: Wrench },
  { path: '/relatorios',    label: 'Relatórios',     icon: BarChart2 },
  { path: '/configuracoes', label: 'Configurações',  icon: Settings },
]

function Layout() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <button className={styles.menuToggle} onClick={() => setMenuAberto(!menuAberto)}>
        {menuAberto ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={menuAberto ? styles.overlayAberto : styles.overlay} onClick={() => setMenuAberto(false)} />

      <aside className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberto : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Box size={20} color="#7eb82c" />
          </div>
          <div>
            <span className={styles.logoTitle}>Almoxarifado</span>
            <span className={styles.logoSub}>Escolar</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                }
              >
                <Icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.usuarioInfo}>
            <div className={styles.avatar}>
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className={styles.usuarioNome}>{usuario?.nome}</span>
              <span className={styles.usuarioPerfil}>{usuario?.perfil}</span>
            </div>
          </div>
          <button className={styles.logout} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout