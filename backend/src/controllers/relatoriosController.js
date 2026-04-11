const db = require('../config/database')

async function estoqueAtual(req, res, next) {
  try {
    const produtos = await db('produtos as p')
      .leftJoin('categorias as c', 'p.categoria_id', 'c.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'p.codigo_interno',
        'p.nome',
        'p.tipo',
        'p.unidade_medida',
        'p.quantidade_atual',
        'p.quantidade_minima',
        'p.localizacao_fisica',
        'p.status',
        'c.nome as categoria_nome'
      )
      .orderBy('p.nome')

    const resumo = {
      total_produtos: produtos.length,
      total_consumiveis: produtos.filter(p => p.tipo === 'consumivel').length,
      total_reutilizaveis: produtos.filter(p => p.tipo === 'reutilizavel').length,
      estoque_baixo: produtos.filter(p => p.quantidade_atual <= p.quantidade_minima && p.quantidade_atual > 0).length,
      estoque_zerado: produtos.filter(p => p.quantidade_atual === 0).length,
      em_manutencao: produtos.filter(p => p.status === 'em_manutencao').length,
    }

    return res.json({ resumo, produtos })
  } catch (error) {
    next(error)
  }
}

async function movimentacoes(req, res, next) {
  try {
    const { data_inicio, data_fim, tipo, produto_id } = req.query

    let query = db('movimentacoes_estoque as m')
      .join('produtos as p', 'm.produto_id', 'p.id')
      .leftJoin('pessoas as pe', 'm.pessoa_id', 'pe.id')
      .leftJoin('usuarios as u', 'm.usuario_id', 'u.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'm.id',
        'm.tipo',
        'm.quantidade',
        'm.motivo',
        'm.observacoes',
        'm.created_at as data',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'p.unidade_medida',
        'pe.nome_completo as pessoa_nome',
        'pe.setor as pessoa_setor',
        'u.nome as operador_nome'
      )
      .orderBy('m.created_at', 'desc')

    if (data_inicio) query = query.where('m.created_at', '>=', new Date(data_inicio))
    if (data_fim) query = query.where('m.created_at', '<=', new Date(data_fim + 'T23:59:59'))
    if (tipo) query = query.where('m.tipo', tipo)
    if (produto_id) query = query.where('m.produto_id', produto_id)

    const movs = await query

    const resumo = {
      total: movs.length,
      entradas: movs.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.quantidade, 0),
      saidas: movs.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.quantidade, 0),
      ajustes: movs.filter(m => m.tipo === 'ajuste').length,
      devolucoes: movs.filter(m => m.tipo === 'devolucao').reduce((acc, m) => acc + m.quantidade, 0),
    }

    return res.json({ resumo, movimentacoes: movs })
  } catch (error) {
    next(error)
  }
}

async function emprestimos(req, res, next) {
  try {
    const { data_inicio, data_fim, status } = req.query

    let query = db('emprestimos as e')
      .join('produtos as p', 'e.produto_id', 'p.id')
      .join('pessoas as pe', 'e.pessoa_id', 'pe.id')
      .leftJoin('usuarios as u', 'e.operador_id', 'u.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'e.id',
        'e.status',
        'e.data_retirada',
        'e.data_devolucao_prevista',
        'e.data_devolucao_efetiva',
        'e.observacoes',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'pe.nome_completo as pessoa_nome',
        'pe.setor as pessoa_setor',
        'u.nome as operador_nome'
      )
      .orderBy('e.data_retirada', 'desc')

    if (data_inicio) query = query.where('e.data_retirada', '>=', new Date(data_inicio))
    if (data_fim) query = query.where('e.data_retirada', '<=', new Date(data_fim + 'T23:59:59'))
    if (status) query = query.where('e.status', status)

    const emps = await query
    const agora = new Date()

    const comAtraso = emps.map(e => ({
      ...e,
      atrasado: e.status === 'emprestado' && e.data_devolucao_prevista && new Date(e.data_devolucao_prevista) < agora
    }))

    const resumo = {
      total: emps.length,
      em_aberto: emps.filter(e => e.status === 'emprestado').length,
      devolvidos: emps.filter(e => e.status === 'devolvido').length,
      atrasados: comAtraso.filter(e => e.atrasado).length,
      perdidos: emps.filter(e => e.status === 'perdido').length,
      danificados: emps.filter(e => e.status === 'danificado').length,
    }

    return res.json({ resumo, emprestimos: comAtraso })
  } catch (error) {
    next(error)
  }
}

module.exports = { estoqueAtual, movimentacoes, emprestimos }