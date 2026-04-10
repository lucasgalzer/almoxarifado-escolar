const db = require('../config/database')

async function indicadores(req, res, next) {
  try {
    const instituicao_id = req.instituicaoId

    const [
      totalProdutos,
      estoqueBaixo,
      estoqueZerado,
      emprestimosAbertos,
      manutencoes,
      solicitacoesPendentes,
    ] = await Promise.all([
      db('produtos').where({ instituicao_id }).count('id as total').first(),
      db('produtos').where({ instituicao_id }).whereRaw('quantidade_atual <= quantidade_minima AND quantidade_atual > 0').count('id as total').first(),
      db('produtos').where({ instituicao_id, quantidade_atual: 0 }).count('id as total').first(),
      db('emprestimos as e').join('produtos as p', 'e.produto_id', 'p.id').where({ 'p.instituicao_id': instituicao_id, 'e.status': 'emprestado' }).count('e.id as total').first(),
      db('manutencoes as m').join('produtos as p', 'm.produto_id', 'p.id').where({ 'p.instituicao_id': instituicao_id }).whereIn('m.status', ['aguardando', 'em_conserto']).count('m.id as total').first(),
      db('solicitacoes').where({ instituicao_id, status: 'pendente' }).count('id as total').first(),
    ])

    const produtosBaixo = await db('produtos')
      .where({ instituicao_id })
      .whereRaw('quantidade_atual <= quantidade_minima')
      .orderBy('quantidade_atual')
      .select('codigo_interno', 'nome', 'quantidade_atual', 'quantidade_minima', 'unidade_medida')
      .limit(5)

    return res.json({
      total_produtos: parseInt(totalProdutos.total),
      estoque_baixo: parseInt(estoqueBaixo.total),
      estoque_zerado: parseInt(estoqueZerado.total),
      emprestimos_abertos: parseInt(emprestimosAbertos.total),
      manutencoes_abertas: parseInt(manutencoes.total),
      solicitacoes_pendentes: parseInt(solicitacoesPendentes.total),
      alertas_estoque: produtosBaixo,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { indicadores }