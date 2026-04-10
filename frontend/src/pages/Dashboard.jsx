import useAuth from '../hooks/useAuth'
import styles from './Dashboard.module.css'

const cards = [
  { label: 'Produtos cadastrados', valor: '--', cor: '#1a237e' },
  { label: 'Empréstimos em aberto', valor: '--', cor: '#e65100' },
  { label: 'Itens em manutenção', valor: '--', cor: '#b71c1c' },
  { label: 'Solicitações pendentes', valor: '--', cor: '#1b5e20' },
]

function Dashboard() {
  const { usuario } = useAuth()

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Dashboard</h1>
          <p className={styles.subtitulo}>Bem-vindo, {usuario?.nome}!</p>
        </div>
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <div key={card.label} className={styles.card}>
            <div className={styles.cardValor} style={{ color: card.cor }}>
              {card.valor}
            </div>
            <div className={styles.cardLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.alertas}>
        <h2 className={styles.secaoTitulo}>Alertas</h2>
        <div className={styles.vazio}>
          Nenhum alerta no momento.
        </div>
      </div>
    </div>
  )
}

export default Dashboard