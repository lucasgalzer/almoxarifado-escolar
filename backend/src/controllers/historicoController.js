const db = require('../config/database')

async function historicoPorProduto(req, res, next) {
  try {
    const { id } = req.params

    const produto = await db('produtos')
      .where({ id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    const [emprestimos, movimentacoes, manutencoes] = await Promise.all([
      db('emprestimos as e')
        .join('pessoas as pe', 'e.pessoa_id', 'pe.id')
        .leftJoin('usuarios as u', 'e.operador_id', 'u.id')
        .where('e.produto_id', id)
        .select(
          'e.id',
          'e.status',
          'e.data_retirada',
          'e.data_devolucao_prevista',
          'e.data_devolucao_efetiva',
          'e.observacoes',
          'pe.nome_completo as pessoa_nome',
          'pe.setor as pessoa_setor',
          'u.nome as operador_nome',
          db.raw("'emprestimo' as tipo_evento")
        )
        .orderBy('e.data_retirada', 'desc'),

      db('movimentacoes_estoque as m')
        .leftJoin('pessoas as pe', 'm.pessoa_id', 'pe.id')
        .leftJoin('usuarios as u', 'm.usuario_id', 'u.id')
        .where('m.produto_id', id)
        .select(
          'm.id',
          'm.tipo as status',
          'm.quantidade',
          'm.motivo',
          'm.observacoes',
          'm.created_at as data_retirada',
          'pe.nome_completo as pessoa_nome',
          'u.nome as operador_nome',
          db.raw("'movimentacao' as tipo_evento")
        )
        .orderBy('m.created_at', 'desc'),

      db('manutencoes as m')
        .leftJoin('usuarios as u', 'm.responsavel_id', 'u.id')
        .where('m.produto_id', id)
        .select(
          'm.id',
          'm.status',
          'm.tipo_problema',
          'm.descricao_defeito',
          'm.fornecedor_tecnico',
          'm.data_abertura as data_retirada',
          'm.data_encerramento',
          'm.custo_real',
          'm.observacoes',
          'u.nome as operador_nome',
          db.raw("'manutencao' as tipo_evento")
        )
        .orderBy('m.data_abertura', 'desc'),
    ])

    return res.json({
      produto,
      emprestimos,
      movimentacoes,
      manutencoes,
      total_emprestimos: emprestimos.length,
      total_movimentacoes: movimentacoes.length,
      total_manutencoes: manutencoes.length,
    })
  } catch (error) {
    next(error)
  }
}

async function historicoPorPessoa(req, res, next) {
  try {
    const { id } = req.params

    const pessoa = await db('pessoas')
      .where({ id, instituicao_id: req.instituicaoId })
      .first()

    if (!pessoa) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' })
    }

    const emprestimos = await db('emprestimos as e')
      .join('produtos as p', 'e.produto_id', 'p.id')
      .leftJoin('usuarios as u', 'e.operador_id', 'u.id')
      .where('e.pessoa_id', id)
      .select(
        'e.*',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'u.nome as operador_nome'
      )
      .orderBy('e.data_retirada', 'desc')

    const movimentacoes = await db('movimentacoes_estoque as m')
      .join('produtos as p', 'm.produto_id', 'p.id')
      .leftJoin('usuarios as u', 'm.usuario_id', 'u.id')
      .where('m.pessoa_id', id)
      .select(
        'm.*',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'u.nome as operador_nome'
      )
      .orderBy('m.created_at', 'desc')

    return res.json({
      pessoa,
      emprestimos,
      movimentacoes,
      total_emprestimos: emprestimos.length,
      pendentes: emprestimos.filter(e => e.status === 'emprestado').length,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { historicoPorProduto, historicoPorPessoa }