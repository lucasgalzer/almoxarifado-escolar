import { useState, useEffect } from 'react'
import api from '../services/api'
import ModalConfirmacao from '../components/ModalConfirmacao'
import { useToast } from '../components/Toast'
import styles from './Configuracoes.module.css'

function Configuracoes() {
  const { addToast } = useToast()
  const [aba, setAba] = useState('categorias')
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [logs, setLogs] = useState([])

  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' })
  const [editandoCategoria, setEditandoCategoria] = useState(null)
  const [erroCategoria, setErroCategoria] = useState('')
  const [categoriaExcluindo, setCategoriaExcluindo] = useState(null)

  const [estoqueMinimoEditando, setEstoqueMinimoEditando] = useState(null)
  const [novoMinimo, setNovoMinimo] = useState('')

  useEffect(() => {
    carregarCategorias()
    carregarProdutos()
    carregarLogs()
  }, [])

  async function carregarCategorias() {
    try {
      const { data } = await api.get('/categorias')
      setCategorias(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function carregarProdutos() {
    try {
      const { data } = await api.get('/produtos')
      setProdutos(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function carregarLogs() {
    try {
      const { data } = await api.get('/audit-log')
      setLogs(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function salvarCategoria(e) {
    e.preventDefault()
    setErroCategoria('')
    setCarregando(true)
    try {
      if (editandoCategoria) {
        await api.put(`/categorias/${editandoCategoria.id}`, novaCategoria)
        setEditandoCategoria(null)
        addToast('Categoria atualizada!', 'sucesso')
      } else {
        await api.post('/categorias', novaCategoria)
        addToast('Categoria criada!', 'sucesso')
      }
      setNovaCategoria({ nome: '', descricao: '' })
      carregarCategorias()
    } catch (error) {
      setErroCategoria(error.response?.data?.erro || 'Erro ao salvar categoria')
    } finally {
      setCarregando(false)
    }
  }

  async function excluirCategoria() {
    try {
      await api.delete(`/categorias/${categoriaExcluindo.id}`)
      addToast('Categoria excluída com sucesso', 'sucesso')
      setCategoriaExcluindo(null)
      carregarCategorias()
    } catch (error) {
      addToast(error.response?.data?.erro || 'Erro ao excluir', 'erro')
      setCategoriaExcluindo(null)
    }
  }

  function editarCategoria(cat) {
    setEditandoCategoria(cat)
    setNovaCategoria({ nome: cat.nome, descricao: cat.descricao || '' })
  }

  async function salvarEstoqueMinimo(produto) {
    try {
      await api.put(`/produtos/${produto.id}`, {
        ...produto,
        quantidade_minima: parseInt(novoMinimo)
      })
      addToast('Estoque mínimo atualizado!', 'sucesso')
      setEstoqueMinimoEditando(null)
      setNovoMinimo('')
      carregarProdutos()
    } catch (error) {
      addToast(error.response?.data?.erro || 'Erro ao salvar', 'erro')
    }
  }

  const unidades = [...new Set(produtos.map(p => p.unidade_medida).filter(Boolean))].sort()

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Configurações</h1>
          <p className={styles.subtitulo}>Gerencie categorias, unidades e estoque mínimo</p>
        </div>
      </div>

      <div className={styles.abas}>
        <button className={`${styles.aba} ${aba === 'categorias' ? styles.abaAtiva : ''}`} onClick={() => setAba('categorias')}>
          Categorias
        </button>
        <button className={`${styles.aba} ${aba === 'unidades' ? styles.abaAtiva : ''}`} onClick={() => setAba('unidades')}>
          Unidades de medida
        </button>
        <button className={`${styles.aba} ${aba === 'estoque_minimo' ? styles.abaAtiva : ''}`} onClick={() => setAba('estoque_minimo')}>
          Estoque mínimo
        </button>
        <button className={`${styles.aba} ${aba === 'audit' ? styles.abaAtiva : ''}`} onClick={() => { setAba('audit'); carregarLogs() }}>
          Audit Log
        </button>
      </div>

      {aba === 'categorias' && (
        <div className={styles.conteudo}>
          <div className={styles.formBox}>
            <h2 className={styles.secaoTitulo}>
              {editandoCategoria ? 'Editar categoria' : 'Nova categoria'}
            </h2>
            <form onSubmit={salvarCategoria} className={styles.form}>
              {erroCategoria && <div className={styles.erro}>{erroCategoria}</div>}
              <div className={styles.formRow}>
                <input
                  placeholder="Nome da categoria *"
                  value={novaCategoria.nome}
                  onChange={e => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
                  className={styles.input}
                />
                <input
                  placeholder="Descrição (opcional)"
                  value={novaCategoria.descricao}
                  onChange={e => setNovaCategoria(prev => ({ ...prev, descricao: e.target.value }))}
                  className={styles.input}
                />
                <button type="submit" disabled={carregando} className={styles.btnSalvar}>
                  {carregando ? '...' : editandoCategoria ? 'Atualizar' : 'Adicionar'}
                </button>
                {editandoCategoria && (
                  <button type="button" onClick={() => { setEditandoCategoria(null); setNovaCategoria({ nome: '', descricao: '' }) }} className={styles.btnCancelar}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={styles.lista}>
            {categorias.length === 0 ? (
              <div className={styles.vazio}>Nenhuma categoria cadastrada.</div>
            ) : (
              categorias.map(cat => (
                <div key={cat.id} className={styles.itemLinha}>
                  <div className={styles.itemInfo}>
                    <strong>{cat.nome}</strong>
                    {cat.descricao && <span>{cat.descricao}</span>}
                  </div>
                  <div className={styles.itemAcoes}>
                    <button onClick={() => editarCategoria(cat)} className={styles.btnEditar}>Editar</button>
                    <button onClick={() => setCategoriaExcluindo(cat)} className={styles.btnExcluir}>Excluir</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {aba === 'unidades' && (
        <div className={styles.conteudo}>
          <div className={styles.formBox}>
            <h2 className={styles.secaoTitulo}>Unidades de medida em uso</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              As unidades são definidas no cadastro de cada produto. As unidades abaixo estão em uso no sistema.
            </p>
          </div>
          <div className={styles.lista}>
            {unidades.length === 0 ? (
              <div className={styles.vazio}>Nenhuma unidade cadastrada ainda.</div>
            ) : (
              unidades.map(u => (
                <div key={u} className={styles.itemLinha}>
                  <div className={styles.itemInfo}>
                    <strong>{u}</strong>
                    <span>{produtos.filter(p => p.unidade_medida === u).length} produto(s) usando</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {aba === 'estoque_minimo' && (
        <div className={styles.conteudo}>
          <div className={styles.formBox}>
            <h2 className={styles.secaoTitulo}>Estoque mínimo por produto</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '0' }}>
              Quando o estoque atingir ou ficar abaixo do mínimo, um alerta aparecerá no dashboard.
            </p>
          </div>
          <div className={styles.tabela}>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Qtd. Atual</th>
                  <th>Qtd. Mínima</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id} className={p.quantidade_atual <= p.quantidade_minima ? styles.rowAlerta : ''}>
                    <td>{p.codigo_interno}</td>
                    <td>{p.nome}</td>
                    <td>{p.tipo === 'consumivel' ? 'Consumível' : 'Reutilizável'}</td>
                    <td>{p.quantidade_atual} {p.unidade_medida}</td>
                    <td>
                      {estoqueMinimoEditando === p.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            value={novoMinimo}
                            onChange={e => setNovoMinimo(e.target.value)}
                            className={styles.inputMinimo}
                            autoFocus
                          />
                          <button onClick={() => salvarEstoqueMinimo(p)} className={styles.btnSalvarInline}>✓</button>
                          <button onClick={() => setEstoqueMinimoEditando(null)} className={styles.btnCancelarInline}>✕</button>
                        </div>
                      ) : (
                        <span>{p.quantidade_minima} {p.unidade_medida}</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${p.quantidade_atual === 0 ? styles.badgeZerado : p.quantidade_atual <= p.quantidade_minima ? styles.badgeBaixo : styles.badgeOk}`}>
                        {p.quantidade_atual === 0 ? 'Zerado' : p.quantidade_atual <= p.quantidade_minima ? 'Baixo' : 'Normal'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => { setEstoqueMinimoEditando(p.id); setNovoMinimo(p.quantidade_minima) }} className={styles.btnEditar}>
                        Alterar mínimo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'audit' && (
        <div className={styles.conteudo}>
          <div className={styles.formBox}>
            <h2 className={styles.secaoTitulo}>Registro de ações do sistema</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Últimas 200 ações registradas. Apenas administradores têm acesso.
            </p>
          </div>
          <div className={styles.tabela}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Tabela</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                      Nenhum registro ainda.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td>{log.usuario_nome || '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeOk}`} style={{ background: '#eff6ff', color: '#2563eb' }}>
                          {log.acao}
                        </span>
                      </td>
                      <td>{log.tabela_afetada}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {categoriaExcluindo && (
        <ModalConfirmacao
          titulo="Excluir categoria"
          mensagem={`Tem certeza que deseja excluir "${categoriaExcluindo.nome}"? Esta ação não pode ser desfeita.`}
          onConfirmar={excluirCategoria}
          onCancelar={() => setCategoriaExcluindo(null)}
        />
      )}
    </div>
  )
}

export default Configuracoes