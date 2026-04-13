const db = require('../config/database')
const { registrar } = require('../utils/auditLog')

async function listarMovimentacoes(req, res, next) {
  try {
    const { produto_id, tipo, data_inicio, data_fim } = req.query

    let query = db('movimentacoes_estoque as m')
      .join('produtos as p', 'm.produto_id', 'p.id')
      .leftJoin('pessoas as pe', 'm.pessoa_id', 'pe.id')
      .leftJoin('usuarios as u', 'm.usuario_id', 'u.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'm.*',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'pe.nome_completo as pessoa_nome',
        'u.nome as usuario_nome'
      )
      .orderBy('m.created_at', 'desc')
      .limit(100)

    if (produto_id) query = query.where('m.produto_id', produto_id)
    if (tipo) query = query.where('m.tipo', tipo)
    if (data_inicio) query = query.where('m.created_at', '>=', data_inicio)
    if (data_fim) query = query.where('m.created_at', '<=', data_fim)

    const movimentacoes = await query
    return res.json(movimentacoes)
  } catch (error) {
    next(error)
  }
}

async function registrarMovimentacao(req, res, next) {
  try {
    const { produto_id, tipo, quantidade, motivo, observacoes, pessoa_id } = req.body

    if (!produto_id) return res.status(400).json({ erro: 'Produto é obrigatório' })
    if (!tipo) return res.status(400).json({ erro: 'Tipo é obrigatório' })
    if (!quantidade || quantidade <= 0) return res.status(400).json({ erro: 'Quantidade deve ser maior que zero' })

    const produto = await db('produtos')
      .where({ id: produto_id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' })

    if (tipo === 'saida' || tipo === 'ajuste' && quantidade < 0) {
      if (produto.quantidade_atual < quantidade) {
        return res.status(400).json({ erro: 'Quantidade insuficiente em estoque' })
      }
    }

    let novaQuantidade = produto.quantidade_atual
    if (tipo === 'entrada' || tipo === 'devolucao') {
      novaQuantidade += parseInt(quantidade)
    } else if (tipo === 'saida') {
      novaQuantidade -= parseInt(quantidade)
    } else if (tipo === 'ajuste') {
      novaQuantidade = parseInt(quantidade)
    }

    await db.transaction(async trx => {
      await trx('movimentacoes_estoque').insert({
        produto_id,
        usuario_id: req.usuarioId,
        pessoa_id: pessoa_id || null,
        tipo,
        quantidade: parseInt(quantidade),
        motivo,
        observacoes,
      })

      await trx('produtos')
        .where({ id: produto_id })
        .update({
          quantidade_atual: novaQuantidade,
          updated_at: new Date()
        })

      await registrar(trx, {
        usuario_id: req.usuarioId,
        instituicao_id: req.instituicaoId,
        acao: `ESTOQUE_${tipo.toUpperCase()}`,
        tabela: 'movimentacoes_estoque',
        registro_id: produto_id,
        dados_antes: { quantidade: produto.quantidade_atual },
        dados_depois: { quantidade: novaQuantidade, tipo, quantidade },
      })
    })

    const produtoAtualizado = await db('produtos').where({ id: produto_id }).first()
    return res.status(201).json({
      mensagem: 'Movimentação registrada com sucesso',
      quantidade_anterior: produto.quantidade_atual,
      quantidade_atual: produtoAtualizado.quantidade_atual
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { listarMovimentacoes, registrarMovimentacao }