import { useState, useEffect } from 'react'
import api from '../services/api'
import styles from './ModalProduto.module.css'

function ModalEmprestimo({ onFechar, onSalvar }) {
  const [produtos, setProdutos] = useState([])
  const [pessoas, setPessoas] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    produto_id: '',
    pessoa_id: '',
    data_devolucao_prevista: '',
    observacoes: '',
  })

  useEffect(() => {
    Promise.all([
      api.get('/produtos', { params: { tipo: 'reutilizavel', status: 'disponivel' } }),
      api.get('/pessoas', { params: { ativo: true } })
    ]).then(([{ data: prods }, { data: pess }]) => {
      setProdutos(prods.filter(p => p.quantidade_atual > 0))
      setPessoas(pess)
    }).catch(console.error)
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const produtoSelecionado = produtos.find(p => p.id === form.produto_id)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!form.produto_id) return setErro('Selecione um produto')
    if (!form.pessoa_id) return setErro('Selecione uma pessoa')

    setCarregando(true)
    try {
      await api.post('/emprestimos', form)
      onSalvar()
    } catch (error) {
      setErro(error.response?.data?.erro || 'Erro ao registrar empréstimo')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Novo Empréstimo</h2>
          <button className={styles.btnFechar} onClick={onFechar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <div className={styles.erro}>{erro}</div>}

          <div className={styles.campo}>
            <label>Produto *</label>
            <select name="produto_id" value={form.produto_id} onChange={handleChange}>
              <option value="">Selecione um produto reutilizável</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo_interno} — {p.nome} (Disponível: {p.quantidade_atual})
                </option>
              ))}
            </select>
          </div>

          {produtoSelecionado && (
            <div style={{ background: '#e8f5e9', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#2e7d32' }}>
              ✅ {produtoSelecionado.nome} — {produtoSelecionado.quantidade_atual} unidade(s) disponível(is)
              {produtoSelecionado.localizacao_fisica && ` — ${produtoSelecionado.localizacao_fisica}`}
            </div>
          )}

          <div className={styles.campo}>
            <label>Pessoa *</label>
            <select name="pessoa_id" value={form.pessoa_id} onChange={handleChange}>
              <option value="">Selecione uma pessoa</option>
              {pessoas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome_completo} {p.setor ? `— ${p.setor}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label>Data de devolução prevista</label>
            <input
              type="datetime-local"
              name="data_devolucao_prevista"
              value={form.data_devolucao_prevista}
              onChange={handleChange}
            />
          </div>

          <div className={styles.campo}>
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: Retirado para aula de artes — turma 6A"
            />
          </div>

          <div className={styles.acoes}>
            <button type="button" onClick={onFechar} className={styles.btnCancelar}>Cancelar</button>
            <button type="submit" disabled={carregando} className={styles.btnSalvar}>
              {carregando ? 'Registrando...' : 'Registrar Empréstimo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEmprestimo