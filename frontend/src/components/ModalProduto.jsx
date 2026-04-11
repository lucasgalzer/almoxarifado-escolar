import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from './Toast'
import styles from './ModalProduto.module.css'

const TIPOS = [
  { value: 'consumivel', label: 'Consumível' },
  { value: 'reutilizavel', label: 'Reutilizável' },
]

const STATUS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'indisponivel', label: 'Indisponível' },
]

const UNIDADES = ['un', 'cx', 'pct', 'resma', 'litro', 'kg', 'metro']

function ModalProduto({ produto, onFechar, onSalvar }) {
  const { addToast } = useToast()
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    codigo_interno: '',
    nome: '',
    descricao: '',
    categoria_id: '',
    unidade_medida: 'un',
    tipo: 'consumivel',
    quantidade_atual: 0,
    quantidade_minima: 0,
    localizacao_fisica: '',
    status: 'disponivel',
    observacoes: '',
  })

  useEffect(() => {
    api.get('/categorias').then(({ data }) => setCategorias(data)).catch(console.error)
    if (produto) {
      setForm({
        codigo_interno: produto.codigo_interno || '',
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        categoria_id: produto.categoria_id || '',
        unidade_medida: produto.unidade_medida || 'un',
        tipo: produto.tipo || 'consumivel',
        quantidade_atual: produto.quantidade_atual || 0,
        quantidade_minima: produto.quantidade_minima || 0,
        localizacao_fisica: produto.localizacao_fisica || '',
        status: produto.status || 'disponivel',
        observacoes: produto.observacoes || '',
      })
    }
  }, [produto])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!form.codigo_interno) return setErro('Código interno é obrigatório')
    if (!form.nome) return setErro('Nome é obrigatório')
    if (!form.tipo) return setErro('Tipo é obrigatório')

    setCarregando(true)
    try {
      if (produto) {
        await api.put(`/produtos/${produto.id}`, form)
      } else {
        await api.post('/produtos', form)
      }
      addToast(produto ? 'Produto atualizado!' : 'Produto cadastrado!', 'sucesso')
      onSalvar()
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao salvar produto'
      setErro(msg)
      addToast(msg, 'erro')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{produto ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className={styles.btnFechar} onClick={onFechar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <div className={styles.erro}>{erro}</div>}

          <div className={styles.grid2}>
            <div className={styles.campo}>
              <label>Código interno *</label>
              <input name="codigo_interno" value={form.codigo_interno} onChange={handleChange} placeholder="P001" />
            </div>
            <div className={styles.campo}>
              <label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.campo}>
            <label>Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome do produto" />
          </div>

          <div className={styles.campo}>
            <label>Descrição</label>
            <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição opcional" />
          </div>

          <div className={styles.grid2}>
            <div className={styles.campo}>
              <label>Categoria</label>
              <select name="categoria_id" value={form.categoria_id} onChange={handleChange}>
                <option value="">Sem categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className={styles.campo}>
              <label>Unidade de medida</label>
              <select name="unidade_medida" value={form.unidade_medida} onChange={handleChange}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.campo}>
              <label>Quantidade atual</label>
              <input type="number" name="quantidade_atual" value={form.quantidade_atual} onChange={handleChange} min="0" disabled={!!produto} />
            </div>
            <div className={styles.campo}>
              <label>Quantidade mínima</label>
              <input type="number" name="quantidade_minima" value={form.quantidade_minima} onChange={handleChange} min="0" />
            </div>
            <div className={styles.campo}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.campo}>
            <label>Localização física</label>
            <input name="localizacao_fisica" value={form.localizacao_fisica} onChange={handleChange} placeholder="Ex: Prateleira A1" />
          </div>

          <div className={styles.campo}>
            <label>Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} placeholder="Observações opcionais" />
          </div>

          <div className={styles.acoes}>
            <button type="button" onClick={onFechar} className={styles.btnCancelar}>Cancelar</button>
            <button type="submit" disabled={carregando} className={styles.btnSalvar}>
              {carregando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalProduto