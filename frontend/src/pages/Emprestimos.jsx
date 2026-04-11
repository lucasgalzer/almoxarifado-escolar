import { useState, useEffect } from 'react'
import api from '../services/api'
import ModalEmprestimo from '../components/ModalEmprestimo'
import styles from './Emprestimos.module.css'
import ModalDevolucao from '../components/ModalDevolucao'
import { useToast } from '../components/Toast'

function Emprestimos() {
  const { addToast } = useToast()
  const [emprestimos, setEmprestimos] = useState([])
  const [pessoas, setPessoas] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('emprestado')
  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [emprestimoDevolvendo, setEmprestimoDevolvendo] = useState(null)

  useEffect(() => {
    api.get('/pessoas', { params: { ativo: true } })
      .then(({ data }) => setPessoas(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    carregarEmprestimos()
  }, [filtroStatus, filtroPessoa])

  async function carregarEmprestimos() {
    try {
      setCarregando(true)
      const params = {}
      if (filtroStatus) params.status = filtroStatus
      if (filtroPessoa) params.pessoa_id = filtroPessoa
      const { data } = await api.get('/emprestimos', { params })
      setEmprestimos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setCarregando(false)
    }
  }

  const setores = [...new Set(pessoas.map(p => p.setor).filter(Boolean))]

  const emprestimosFiltrados = filtroSetor
    ? emprestimos.filter(e => e.pessoa_setor === filtroSetor)
    : emprestimos

  async function handleDevolver(emprestimo) {
    setEmprestimoDevolvendo(emprestimo)
  }


  function formatarData(data) {
    if (!data) return '—'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  function badgeStatus(emp) {
    if (emp.atrasado) return styles.badgeAtrasado
    const mapa = {
      emprestado: styles.badgeEmprestado,
      devolvido: styles.badgeDevolvido,
      atrasado: styles.badgeAtrasado,
      perdido: styles.badgePerdido,
      danificado: styles.badgeDanificado,
    }
    return mapa[emp.status] || ''
  }

  function labelStatus(emp) {
    if (emp.atrasado && emp.status === 'emprestado') return '⚠ Atrasado'
    const mapa = {
      emprestado: 'Emprestado',
      devolvido: 'Devolvido',
      atrasado: 'Atrasado',
      perdido: 'Perdido',
      danificado: 'Danificado',
    }
    return mapa[emp.status] || emp.status
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Empréstimos</h1>
          <p className={styles.subtitulo}>{emprestimosFiltrados.length} registro(s) encontrado(s)</p>
        </div>
        <button className={styles.btnNovo} onClick={() => setModalAberto(true)}>
          + Novo Empréstimo
        </button>
      </div>

      <div className={styles.filtros}>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={styles.select}>
          <option value="">Todos os status</option>
          <option value="emprestado">Em aberto</option>
          <option value="devolvido">Devolvidos</option>
          <option value="perdido">Perdidos</option>
          <option value="danificado">Danificados</option>
        </select>

        <select value={filtroPessoa} onChange={e => setFiltroPessoa(e.target.value)} className={styles.select}>
          <option value="">Todas as pessoas</option>
          {pessoas.map(p => (
            <option key={p.id} value={p.id}>{p.nome_completo}</option>
          ))}
        </select>

        <select value={filtroSetor} onChange={e => setFiltroSetor(e.target.value)} className={styles.select}>
          <option value="">Todos os setores</option>
          {setores.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className={styles.tabela}>
        {carregando ? (
          <div className={styles.vazio}>Carregando...</div>
        ) : emprestimosFiltrados.length === 0 ? (
          <div className={styles.vazio}>Nenhum empréstimo encontrado.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Pessoa</th>
                <th>Setor</th>
                <th>Retirada</th>
                <th>Devolução prevista</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {emprestimosFiltrados.map(emp => (
                <tr key={emp.id} className={emp.atrasado ? styles.rowAtrasado : ''}>
                  <td>
                    <strong>{emp.produto_nome}</strong>
                    <br />
                    <small style={{ color: '#888' }}>{emp.codigo_interno}</small>
                  </td>
                  <td>{emp.pessoa_nome}</td>
                  <td>{emp.pessoa_setor || '—'}</td>
                  <td>{formatarData(emp.data_retirada)}</td>
                  <td>{formatarData(emp.data_devolucao_prevista)}</td>
                  <td>
                    <span className={`${styles.badge} ${badgeStatus(emp)}`}>
                      {labelStatus(emp)}
                    </span>
                  </td>
                  <td>
                    {emp.status === 'emprestado' && (
                      <button
  className={styles.btnDevolver}
  onClick={() => handleDevolver(emp)}
>
  Devolver
</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalEmprestimo
          onFechar={() => setModalAberto(false)}
          onSalvar={() => { setModalAberto(false); carregarEmprestimos() }}
        />
      )}

      {emprestimoDevolvendo && (
  <ModalDevolucao
    emprestimo={emprestimoDevolvendo}
    onFechar={() => setEmprestimoDevolvendo(null)}
    onSalvar={() => {
      setEmprestimoDevolvendo(null)
      carregarEmprestimos()
    }}
  />
)}
    </div>
  )
}

export default Emprestimos