import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import styles from './Dashboard.module.css'

function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.get('/dashboard/indicadores')
      .then(({ data }) => setDados(data))
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [])

  const cards = dados ? [
    { label: 'Produtos cadastrados', valor: dados.total_produtos, cor: '#1a237e', rota: '/produtos' },
    { label: 'Empréstimos em aberto', valor: dados.emprestimos_abertos, cor: '#e65100', rota: '/emprestimos' },
    { label: 'Itens em manutenção', valor: dados.manutencoes_abertas, cor: '#b71c1c', rota: '/manutencao' },
    { label: 'Solicitações pendentes', valor: dados.solicitacoes_pendentes, cor: '#1b5e20', rota: '/solicitacoes' },
  ] : []

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Dashboard</h1>
          <p className={styles.subtitulo}>Bem-vindo, {usuario?.nome}!</p>
        </div>
      </div>

      <div className={styles.cards}>
        {carregando ? (
          <p>Carregando...</p>
        ) : cards.map(card => (
          <div
            key={card.label}
            className={styles.card}
            onClick={() => navigate(card.rota)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardValor} style={{ color: card.cor }}>
              {card.valor}
            </div>
            <div className={styles.cardLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      {dados && (dados.emprestimos_abertos > 0 || dados.manutencoes_abertas > 0 || dados.solicitacoes_pendentes > 0) && (
        <div className={styles.alertas} style={{ marginBottom: '16px' }}>
          <h2 className={styles.secaoTitulo}>Pendências</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {dados.emprestimos_abertos > 0 && (
              <div onClick={() => navigate('/emprestimos')} style={{ flex: 1, background: '#e3f2fd', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1565c0' }}>{dados.emprestimos_abertos}</div>
                <div style={{ fontSize: '13px', color: '#1565c0', marginTop: '4px' }}>Empréstimos em aberto</div>
              </div>
            )}
            {dados.manutencoes_abertas > 0 && (
              <div onClick={() => navigate('/manutencao')} style={{ flex: 1, background: '#fff3e0', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#e65100' }}>{dados.manutencoes_abertas}</div>
                <div style={{ fontSize: '13px', color: '#e65100', marginTop: '4px' }}>Itens em manutenção</div>
              </div>
            )}
            {dados.solicitacoes_pendentes > 0 && (
              <div onClick={() => navigate('/solicitacoes')} style={{ flex: 1, background: '#fdecea', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#c62828' }}>{dados.solicitacoes_pendentes}</div>
                <div style={{ fontSize: '13px', color: '#c62828', marginTop: '4px' }}>Solicitações pendentes</div>
              </div>
            )}
          </div>
        </div>
      )}

      {dados && (dados.estoque_baixo > 0 || dados.estoque_zerado > 0) && (
        <div className={styles.alertas}>
          <h2 className={styles.secaoTitulo}>Alertas de estoque</h2>
          {dados.alertas_estoque.map(produto => (
            <div
              key={produto.codigo_interno}
              className={produto.quantidade_atual === 0 ? styles.alertaZerado : styles.alertaBaixo}
            >
              <div className={styles.alertaInfo}>
                <strong>{produto.nome}</strong>
                <span>{produto.codigo_interno}</span>
              </div>
              <div className={styles.alertaQtd}>
                {produto.quantidade_atual === 0
                  ? '⚠️ Zerado'
                  : `⚠️ Baixo: ${produto.quantidade_atual} / ${produto.quantidade_minima} ${produto.unidade_medida}`
                }
              </div>
            </div>
          ))}
          <button className={styles.btnEstoque} onClick={() => navigate('/estoque')}>
            Ver estoque completo →
          </button>
        </div>
      )}

      {dados && dados.estoque_baixo === 0 && dados.estoque_zerado === 0 && (
        <div className={styles.alertas}>
          <h2 className={styles.secaoTitulo}>Alertas</h2>
          <div className={styles.vazio}>Nenhum alerta no momento. Estoque em ordem! ✅</div>
        </div>
      )}
    </div>
  )
}

export default Dashboard