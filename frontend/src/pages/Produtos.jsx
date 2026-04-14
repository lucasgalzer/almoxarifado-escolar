import { useState, useEffect } from 'react'
import api from '../services/api'
import ModalProduto from '../components/ModalProduto'
import ModalImportacaoCSV from '../components/ModalImportacaoCSV'
import ModalHistorico from '../components/ModalHistorico'
import ModalConfirmacao from '../components/ModalConfirmacao'
import { useToast } from '../components/Toast'
import styles from './Produtos.module.css'

function Produtos() {
  const { addToast } = useToast()
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [modalCSVAberto, setModalCSVAberto] = useState(false)
  const [produtoHistorico, setProdutoHistorico] = useState(null)
  const [produtoExcluindo, setProdutoExcluindo] = useState(null)

  useEffect(() => {
    carregarProdutos()
  }, [busca, filtroTipo, filtroStatus])

  async function carregarProdutos() {
    try {
      setCarregando(true)
      const params = {}
      if (busca) params.busca = busca
      if (filtroTipo) params.tipo = filtroTipo
      if (filtroStatus) params.status = filtroStatus
      const { data } = await api.get('/produtos', { params })
      setProdutos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setProdutoSelecionado(null)
    setModalAberto(true)
  }

  function abrirModalEditar(produto) {
    setProdutoSelecionado(produto)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setProdutoSelecionado(null)
  }

  function aoSalvar() {
    fecharModal()
    carregarProdutos()
  }

  async function excluirProduto() {
    try {
      await api.delete(`/produtos/${produtoExcluindo.id}`)
      addToast('Produto excluído com sucesso', 'sucesso')
      setProdutoExcluindo(null)
      carregarProdutos()
    } catch (error) {
      addToast(error.response?.data?.erro || 'Erro ao excluir', 'erro')
      setProdutoExcluindo(null)
    }
  }

  function badgeTipo(tipo) {
    return tipo === 'consumivel' ? styles.badgeConsumivel : styles.badgeReutilizavel
  }

  function badgeStatus(status) {
    const mapa = {
      disponivel: styles.badgeDisponivel,
      indisponivel: styles.badgeIndisponivel,
      em_manutencao: styles.badgeManutencao,
    }
    return mapa[status] || ''
  }

  function labelStatus(status) {
    const mapa = {
      disponivel: 'Disponível',
      indisponivel: 'Indisponível',
      em_manutencao: 'Manutenção',
    }
    return mapa[status] || status
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Produtos</h1>
          <p className={styles.subtitulo}>{produtos.length} produto(s) encontrado(s)</p>
        </div>
        <div className={styles.acoes}>
          <button className={styles.btnImportar} onClick={() => setModalCSVAberto(true)}>
            Importar CSV
          </button>
          <button className={styles.btnNovo} onClick={abrirModalNovo}>
            + Novo Produto
          </button>
        </div>
      </div>

      <div className={styles.filtros}>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className={styles.inputBusca}
        />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={styles.select}>
          <option value="">Todos os tipos</option>
          <option value="consumivel">Consumível</option>
          <option value="reutilizavel">Reutilizável</option>
        </select>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={styles.select}>
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="indisponivel">Indisponível</option>
          <option value="em_manutencao">Manutenção</option>
        </select>
      </div>

      <div className={styles.tabela}>
        {carregando ? (
          <div className={styles.vazio}>Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className={styles.vazio}>Nenhum produto encontrado.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Qtd. Atual</th>
                <th>Qtd. Mínima</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(produto => (
                <tr key={produto.id} className={produto.quantidade_atual <= produto.quantidade_minima ? styles.rowAlerta : ''}>
                  <td>{produto.codigo_interno}</td>
                  <td>{produto.nome}</td>
                  <td>
                    <span className={`${styles.badge} ${badgeTipo(produto.tipo)}`}>
                      {produto.tipo === 'consumivel' ? 'Consumível' : 'Reutilizável'}
                    </span>
                  </td>
                  <td>{produto.categoria_nome || '—'}</td>
                  <td>{produto.quantidade_atual}</td>
                  <td>{produto.quantidade_minima}</td>
                  <td>
                    <span className={`${styles.badge} ${badgeStatus(produto.status)}`}>
                      {labelStatus(produto.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button className={styles.btnEditar} onClick={() => abrirModalEditar(produto)}>
                        Editar
                      </button>
                      <button className={styles.btnHistorico} onClick={() => setProdutoHistorico(produto)}>
                        Histórico
                      </button>
                      <button className={styles.btnExcluir} onClick={() => setProdutoExcluindo(produto)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalProduto
          produto={produtoSelecionado}
          onFechar={fecharModal}
          onSalvar={aoSalvar}
        />
      )}

      {modalCSVAberto && (
        <ModalImportacaoCSV
          onFechar={() => setModalCSVAberto(false)}
          onImportado={carregarProdutos}
        />
      )}

      {produtoHistorico && (
        <ModalHistorico
          produtoId={produtoHistorico.id}
          onFechar={() => setProdutoHistorico(null)}
        />
      )}

      {produtoExcluindo && (
        <ModalConfirmacao
          titulo="Excluir produto"
          mensagem={`Tem certeza que deseja excluir "${produtoExcluindo.nome}"? Esta ação não pode ser desfeita.`}
          onConfirmar={excluirProduto}
          onCancelar={() => setProdutoExcluindo(null)}
        />
      )}
    </div>
  )
}

export default Produtos