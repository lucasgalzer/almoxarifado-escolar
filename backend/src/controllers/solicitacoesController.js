const db = require('../config/database')
const { registrar } = require('../utils/auditLog')

async function listar(req, res, next) {
  try {
    const { status } = req.query

    let query = db('solicitacoes as s')
      .join('usuarios as u', 's.solicitante_id', 'u.id')
      .leftJoin('usuarios as op', 's.operador_id', 'op.id')
      .where('s.instituicao_id', req.instituicaoId)
      .select('s.*', 'u.nome as solicitante_nome', 'op.nome as operador_nome')
      .orderBy('s.created_at', 'desc')

    if (status) query = query.where('s.status', status)

    const solicitacoes = await query

    const comItens = await Promise.all(
      solicitacoes.map(async s => {
        const itens = await db('itens_solicitacao as i')
          .join('produtos as p', 'i.produto_id', 'p.id')
          .where('i.solicitacao_id', s.id)
          .select('i.*', 'p.nome as produto_nome', 'p.codigo_interno', 'p.unidade_medida')
        return { ...s, itens }
      })
    )

    return res.json(comItens)
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const solicitacao = await db('solicitacoes as s')
      .join('usuarios as u', 's.solicitante_id', 'u.id')
      .leftJoin('usuarios as op', 's.operador_id', 'op.id')
      .where('s.id', req.params.id)
      .where('s.instituicao_id', req.instituicaoId)
      .select('s.*', 'u.nome as solicitante_nome', 'op.nome as operador_nome')
      .first()

    if (!solicitacao) {
      return res.status(404).json({ erro: 'Solicitação não encontrada' })
    }

    const itens = await db('itens_solicitacao as i')
      .join('produtos as p', 'i.produto_id', 'p.id')
      .where('i.solicitacao_id', solicitacao.id)
      .select('i.*', 'p.nome as produto_nome', 'p.codigo_interno', 'p.unidade_medida', 'p.quantidade_atual')

    return res.json({ ...solicitacao, itens })
  } catch (error) {
    next(error)
  }
}

async function criar(req, res, next) {
  try {
    const { itens, data_desejada, finalidade, observacoes } = req.body

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: 'Adicione pelo menos um item' })
    }

    for (const item of itens) {
      if (!item.produto_id) return res.status(400).json({ erro: 'Produto inválido na lista' })
      if (!item.quantidade_solicitada || item.quantidade_solicitada <= 0) {
        return res.status(400).json({ erro: 'Quantidade inválida na lista' })
      }
    }

    const [solicitacao] = await db.transaction(async trx => {
      const [sol] = await trx('solicitacoes').insert({
        instituicao_id: req.instituicaoId,
        solicitante_id: req.usuarioId,
        status: 'pendente',
        data_desejada: data_desejada || null,
        finalidade,
        observacoes,
      }).returning('*')

      await trx('itens_solicitacao').insert(
        itens.map(item => ({
          solicitacao_id: sol.id,
          produto_id: item.produto_id,
          quantidade_solicitada: item.quantidade_solicitada,
          observacoes: item.observacoes || null,
        }))
      )

      await registrar(trx, {
        usuario_id: req.usuarioId,
        instituicao_id: req.instituicaoId,
        acao: 'SOLICITACAO_CRIADA',
        tabela: 'solicitacoes',
        registro_id: sol.id,
        dados_depois: sol,
      })

      return [sol]
    })

    return res.status(201).json(solicitacao)
  } catch (error) {
    next(error)
  }
}

async function atualizarStatus(req, res, next) {
  try {
    const { status, observacoes } = req.body
    const statusValidos = ['aprovada', 'pronta', 'entregue', 'recusada', 'cancelada']

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido' })
    }

    const solicitacao = await db('solicitacoes')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!solicitacao) {
      return res.status(404).json({ erro: 'Solicitação não encontrada' })
    }

    const [atualizada] = await db('solicitacoes')
      .where({ id: req.params.id })
      .update({
        status,
        operador_id: req.usuarioId,
        observacoes: observacoes || solicitacao.observacoes,
        updated_at: new Date()
      }).returning('*')

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: `SOLICITACAO_${status.toUpperCase()}`,
      tabela: 'solicitacoes',
      registro_id: req.params.id,
      dados_antes: { status: solicitacao.status },
      dados_depois: { status },
    })

    return res.json(atualizada)
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, criar, atualizarStatus }