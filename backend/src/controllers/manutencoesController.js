const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const { status } = req.query

    let query = db('manutencoes as m')
      .join('produtos as p', 'm.produto_id', 'p.id')
      .leftJoin('usuarios as u', 'm.responsavel_id', 'u.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'm.*',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'u.nome as responsavel_nome'
      )
      .orderBy('m.data_abertura', 'desc')

    if (status) query = query.where('m.status', status)

    const manutencoes = await query
    return res.json(manutencoes)
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const manutencao = await db('manutencoes as m')
      .join('produtos as p', 'm.produto_id', 'p.id')
      .leftJoin('usuarios as u', 'm.responsavel_id', 'u.id')
      .where('m.id', req.params.id)
      .where('p.instituicao_id', req.instituicaoId)
      .select('m.*', 'p.nome as produto_nome', 'p.codigo_interno', 'u.nome as responsavel_nome')
      .first()

    if (!manutencao) {
      return res.status(404).json({ erro: 'Manutenção não encontrada' })
    }

    return res.json(manutencao)
  } catch (error) {
    next(error)
  }
}

async function abrir(req, res, next) {
  try {
    const {
      produto_id, tipo_problema, descricao_defeito,
      fornecedor_tecnico, data_envio, data_previsao_retorno,
      custo_estimado, observacoes
    } = req.body

    if (!produto_id) return res.status(400).json({ erro: 'Produto é obrigatório' })
    if (!tipo_problema) return res.status(400).json({ erro: 'Tipo do problema é obrigatório' })

    const produto = await db('produtos')
      .where({ id: produto_id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' })

    const [manutencao] = await db.transaction(async trx => {
      const [man] = await trx('manutencoes').insert({
        produto_id,
        responsavel_id: req.usuarioId,
        tipo_problema,
        descricao_defeito,
        fornecedor_tecnico,
        status: 'aguardando',
        data_abertura: new Date(),
        data_envio: data_envio || null,
        data_previsao_retorno: data_previsao_retorno || null,
        custo_estimado: custo_estimado || null,
        observacoes,
      }).returning('*')

      await trx('produtos').where({ id: produto_id }).update({
        status: 'em_manutencao',
        updated_at: new Date()
      })

      return [man]
    })

    return res.status(201).json(manutencao)
  } catch (error) {
    next(error)
  }
}

async function atualizarStatus(req, res, next) {
  try {
    const {
      status, fornecedor_tecnico, data_envio,
      data_previsao_retorno, custo_real, observacoes
    } = req.body

    const statusValidos = ['aguardando', 'em_conserto', 'consertado', 'descartado']
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido' })
    }

    const manutencao = await db('manutencoes as m')
      .join('produtos as p', 'm.produto_id', 'p.id')
      .where('m.id', req.params.id)
      .where('p.instituicao_id', req.instituicaoId)
      .select('m.*')
      .first()

    if (!manutencao) {
      return res.status(404).json({ erro: 'Manutenção não encontrada' })
    }

    const encerrado = status === 'consertado' || status === 'descartado'

    await db.transaction(async trx => {
      await trx('manutencoes').where({ id: req.params.id }).update({
        status,
        fornecedor_tecnico: fornecedor_tecnico || manutencao.fornecedor_tecnico,
        data_envio: data_envio || manutencao.data_envio,
        data_previsao_retorno: data_previsao_retorno || manutencao.data_previsao_retorno,
        custo_real: custo_real || null,
        observacoes: observacoes || manutencao.observacoes,
        data_encerramento: encerrado ? new Date() : null,
        updated_at: new Date()
      })

      if (encerrado) {
        const novoStatus = status === 'consertado' ? 'disponivel' : 'indisponivel'
        await trx('produtos').where({ id: manutencao.produto_id }).update({
          status: novoStatus,
          updated_at: new Date()
        })
      }
    })

    return res.json({ mensagem: `Manutenção atualizada para ${status}` })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, abrir, atualizarStatus }