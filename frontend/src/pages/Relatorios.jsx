import { useState } from 'react'
import api from '../services/api'
import styles from './Relatorios.module.css'

const ABAS = [
  { id: 'estoque', label: '📦 Estoque atual' },
  { id: 'movimentacoes', label: '🔄 Movimentações' },
  { id: 'emprestimos', label: '🔁 Empréstimos' },
]

function Relatorios() {
  const [aba, setAba] = useState('estoque')
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    tipo: '',
    status: '',
  })

  function handleFiltro(e) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  async function gerarRelatorio() {
    setCarregando(true)
    setDados(null)
    try {
      const params = {}
      if (filtros.data_inicio) params.data_inicio = filtros.data_inicio
      if (filtros.data_fim) params.data_fim = filtros.data_fim
      if (filtros.tipo) params.tipo = filtros.tipo
      if (filtros.status) params.status = filtros.status

      const { data } = await api.get(`/relatorios/${aba}`, { params })
      setDados(data)
    } catch (error) {
      console.error(error)
    } finally {
      setCarregando(false)
    }
  }

  function formatarData(data) {
    if (!data) return '—'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  function exportarCSV() {
    if (!dados) return

    let linhas = []
    let nome = ''

    if (aba === 'estoque') {
      nome = 'estoque_atual'
      linhas = [
        ['Código', 'Nome', 'Tipo', 'Categoria', 'Qtd. Atual', 'Qtd. Mínima', 'Unidade', 'Localização', 'Status'],
        ...dados.produtos.map(p => [
          p.codigo_interno, p.nome, p.tipo, p.categoria_nome || '',
          p.quantidade_atual, p.quantidade_minima, p.unidade_medida,
          p.localizacao_fisica || '', p.status
        ])
      ]
    } else if (aba === 'movimentacoes') {
      nome = 'movimentacoes'
      linhas = [
        ['Data', 'Produto', 'Código', 'Tipo', 'Quantidade', 'Motivo', 'Pessoa', 'Setor', 'Operador'],
        ...dados.movimentacoes.map(m => [
          formatarData(m.data), m.produto_nome, m.codigo_interno,
          m.tipo, m.quantidade, m.motivo || '',
          m.pessoa_nome || '', m.pessoa_setor || '', m.operador_nome || ''
        ])
      ]
    } else if (aba === 'emprestimos') {
      nome = 'emprestimos'
      linhas = [
        ['Produto', 'Código', 'Pessoa', 'Setor', 'Retirada', 'Devolução Prevista', 'Devolução Efetiva', 'Status', 'Atrasado'],
        ...dados.emprestimos.map(e => [
          e.produto_nome, e.codigo_interno, e.pessoa_nome, e.pessoa_setor || '',
          formatarData(e.data_retirada), formatarData(e.data_devolucao_prevista),
          formatarData(e.data_devolucao_efetiva), e.status, e.atrasado ? 'Sim' : 'Não'
        ])
      ]
    }

    const csv = linhas.map(l => l.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nome}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Relatórios</h1>
          <p className={styles.subtitulo}>Gere e exporte relatórios do sistema</p>
        </div>
        {dados && (
          <button className={styles.btnExportar} onClick={exportarCSV}>
            ⬇ Exportar CSV
          </button>
        )}
      </div>

      <div className={styles.abas}>
        {ABAS.map(a => (
          <button
            key={a.id}
            className={`${styles.aba} ${aba === a.id ? styles.abaAtiva : ''}`}
            onClick={() => { setAba(a.id); setDados(null) }}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className={styles.filtrosBox}>
        {aba !== 'estoque' && (
          <>
            <div className={styles.filtroGrupo}>
              <label>Data início</label>
              <input type="date" name="data_inicio" value={filtros.data_inicio} onChange={handleFiltro} className={styles.input} />
            </div>
            <div className={styles.filtroGrupo}>
              <label>Data fim</label>
              <input type="date" name="data_fim" value={filtros.data_fim} onChange={handleFiltro} className={styles.input} />
            </div>
          </>
        )}

        {aba === 'movimentacoes' && (
          <div className={styles.filtroGrupo}>
            <label>Tipo</label>
            <select name="tipo" value={filtros.tipo} onChange={handleFiltro} className={styles.select}>
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
              <option value="devolucao">Devolução</option>
            </select>
          </div>
        )}

        {aba === 'emprestimos' && (
          <div className={styles.filtroGrupo}>
            <label>Status</label>
            <select name="status" value={filtros.status} onChange={handleFiltro} className={styles.select}>
              <option value="">Todos</option>
              <option value="emprestado">Em aberto</option>
              <option value="devolvido">Devolvido</option>
              <option value="perdido">Perdido</option>
              <option value="danificado">Danificado</option>
            </select>
          </div>
        )}

        <button className={styles.btnGerar} onClick={gerarRelatorio} disabled={carregando}>
          {carregando ? 'Gerando...' : '🔍 Gerar relatório'}
        </button>
      </div>

      {dados && (
        <>
          <div className={styles.resumoCards}>
            {Object.entries(dados.resumo).map(([key, val]) => (
              <div key={key} className={styles.resumoCard}>
                <div className={styles.resumoValor}>{val}</div>
                <div className={styles.resumoLabel}>{key.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>

          <div className={styles.tabela}>
            {aba === 'estoque' && (
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Categoria</th>
                    <th>Qtd. Atual</th>
                    <th>Qtd. Mínima</th>
                    <th>Localização</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.produtos.map(p => (
                    <tr key={p.codigo_interno} className={p.quantidade_atual <= p.quantidade_minima ? styles.rowAlerta : ''}>
                      <td>{p.codigo_interno}</td>
                      <td>{p.nome}</td>
                      <td>{p.tipo === 'consumivel' ? 'Consumível' : 'Reutilizável'}</td>
                      <td>{p.categoria_nome || '—'}</td>
                      <td><strong>{p.quantidade_atual}</strong> {p.unidade_medida}</td>
                      <td>{p.quantidade_minima} {p.unidade_medida}</td>
                      <td>{p.localizacao_fisica || '—'}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {aba === 'movimentacoes' && (
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Motivo</th>
                    <th>Pessoa</th>
                    <th>Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.movimentacoes.map(m => (
                    <tr key={m.id}>
                      <td>{formatarData(m.data)}</td>
                      <td>{m.produto_nome}<br /><small style={{ color: '#888' }}>{m.codigo_interno}</small></td>
                      <td>{m.tipo}</td>
                      <td><strong>{m.quantidade}</strong></td>
                      <td>{m.motivo || '—'}</td>
                      <td>{m.pessoa_nome || '—'}</td>
                      <td>{m.operador_nome || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {aba === 'emprestimos' && (
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Pessoa</th>
                    <th>Setor</th>
                    <th>Retirada</th>
                    <th>Prev. Devolução</th>
                    <th>Devolvido em</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.emprestimos.map(e => (
                    <tr key={e.id} className={e.atrasado ? styles.rowAlerta : ''}>
                      <td>{e.produto_nome}<br /><small style={{ color: '#888' }}>{e.codigo_interno}</small></td>
                      <td>{e.pessoa_nome}</td>
                      <td>{e.pessoa_setor || '—'}</td>
                      <td>{formatarData(e.data_retirada)}</td>
                      <td>{formatarData(e.data_devolucao_prevista)}</td>
                      <td>{formatarData(e.data_devolucao_efetiva)}</td>
                      <td>{e.atrasado ? '⚠ Atrasado' : e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!dados && !carregando && (
        <div className={styles.semDados}>
          Selecione os filtros e clique em <strong>Gerar relatório</strong> para visualizar os dados.
        </div>
      )}
    </div>
  )
}

export default Relatorios