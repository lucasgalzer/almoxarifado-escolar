import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'

const menuItems = [
  { path: '/dashboard',   label: 'Dashboard'     },
  { path: '/produtos',    label: 'Produtos'       },
  { path: '/pessoas',     label: 'Pessoas'        },
  { path: '/estoque',     label: 'Estoque'        },
  { path: '/emprestimos', label: 'Empréstimos'    },
  { path: '/solicitacoes',label: 'Solicitações'   },
  { path: '/manutencao',  label: 'Manutenção'     },
  { path: '/relatorios',  label: 'Relatórios'     },
]

function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>📦</span>
          <strong>Almoxarifado</strong>
        </div>

        <nav className={styles.nav}>
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className={styles.logout} onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout