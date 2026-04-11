import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import styles from './Layout.module.css'

const menuItems = [
  { path: '/dashboard',     label: '📊 Dashboard'    },
  { path: '/produtos',      label: '📦 Produtos'      },
  { path: '/pessoas',       label: '👤 Pessoas'       },
  { path: '/estoque',       label: '🗂️ Estoque'       },
  { path: '/emprestimos',   label: '🔁 Empréstimos'   },
  { path: '/solicitacoes',  label: '📬 Solicitações'  },
  { path: '/manutencao',    label: '🔧 Manutenção'    },
  { path: '/relatorios',    label: '📈 Relatórios'    },
  { path: '/configuracoes', label: '⚙️ Configurações' },
]

function Layout() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function fecharMenu() {
    setMenuAberto(false)
  }

  return (
    <div className={styles.container}>
      <button className={styles.menuToggle} onClick={() => setMenuAberto(!menuAberto)}>
        ☰
      </button>

      <div
        className={menuAberto ? styles.overlayAberto : styles.overlay}
        onClick={fecharMenu}
      />

      <aside className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberto : ''}`}>
        <div className={styles.logo}>
          <span>📦</span>
          <strong>Almoxarifado</strong>
        </div>

        <nav className={styles.nav}>
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={fecharMenu}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.usuarioInfo}>
            <span className={styles.usuarioNome}>{usuario?.nome}</span>
            <span className={styles.usuarioPerfil}>{usuario?.perfil}</span>
          </div>
          <button className={styles.logout} onClick={handleLogout}>
            Sair
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