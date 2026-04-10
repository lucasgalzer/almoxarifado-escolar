const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const { status, pessoa_id, produto_id } = req.query

    let query = db('emprestimos as e')
      .join('produtos as p', 'e.produto_id', 'p.id')
      .join('pessoas as pe', 'e.pessoa_id', 'pe.id')
      .leftJoin('usuarios as u', 'e.operador_id', 'u.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'e.*',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'p.unidade_medida',
        'pe.nome_completo as pessoa_nome',
        'pe.setor as pessoa_setor',
        'u.nome as operador_nome'
      )
      .orderBy('e.created_at', 'desc')

    if (status) query = query.where('e.status', status)
    if (pessoa_id) query = query.where('e.pessoa_id', pessoa_id)
    if (produto_id) query = query.where('e.produto_id', produto_id)

    const emprestimos = await query

    const agora = new Date()
    const comStatus = emprestimos.map(e => ({
      ...e,
      atrasado: e.status === 'emprestado' &&
        e.data_devolucao_prevista &&
        new Date(e.data_devolucao_prevista) < agora
    }))

    return res.json(comStatus)
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const emprestimo = await db('emprestimos as e')
      .join('produtos as p', 'e.produto_id', 'p.id')
      .join('pessoas as pe', 'e.pessoa_id', 'pe.id')
      .leftJoin('usuarios as u', 'e.operador_id', 'u.id')
      .where('e.id', req.params.id)
      .where('p.instituicao_id', req.instituicaoId)
      .select(
        'e.*',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'pe.nome_completo as pessoa_nome',
        'u.nome as operador_nome'
      )
      .first()

    if (!emprestimo) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' })
    }

    return res.json(emprestimo)
  } catch (error) {
    next(error)
  }
}

async function registrar(req, res, next) {
  try {
    const { produto_id, pessoa_id, data_devolucao_prevista, observacoes } = req.body

    if (!produto_id) return res.status(400).json({ erro: 'Produto é obrigatório' })
    if (!pessoa_id) return res.status(400).json({ erro: 'Pessoa é obrigatória' })

    const produto = await db('produtos')
      .where({ id: produto_id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' })

    if (produto.tipo !== 'reutilizavel') {
      return res.status(400).json({ erro: 'Apenas itens reutilizáveis podem ser emprestados' })
    }

    if (produto.status !== 'disponivel') {
      return res.status(400).json({ erro: `Produto está ${produto.status} e não pode ser emprestado` })
    }

    if (produto.quantidade_atual <= 0) {
      return res.status(400).json({ erro: 'Produto sem estoque disponível' })
    }

    const pessoa = await db('pessoas')
      .where({ id: pessoa_id, instituicao_id: req.instituicaoId, ativo: true })
      .first()

    if (!pessoa) return res.status(404).json({ erro: 'Pessoa não encontrada ou inativa' })

    const [emprestimo] = await db.transaction(async trx => {
      const [emp] = await trx('emprestimos').insert({
        produto_id,
        pessoa_id,
        operador_id: req.usuarioId,
        status: 'emprestado',
        data_retirada: new Date(),
        data_devolucao_prevista: data_devolucao_prevista || null,
        observacoes,
      }).returning('*')

      await trx('produtos').where({ id: produto_id }).update({
        quantidade_atual: produto.quantidade_atual - 1,
        updated_at: new Date()
      })

      await trx('movimentacoes_estoque').insert({
        produto_id,
        usuario_id: req.usuarioId,
        pessoa_id,
        tipo: 'saida',
        quantidade: 1,
        motivo: 'Empréstimo',
        observacoes,
      })

      return [emp]
    })

    return res.status(201).json(emprestimo)
  } catch (error) {
    next(error)
  }
}

async function devolver(req, res, next) {
  try {
    const { observacoes, status } = req.body

    const emprestimo = await db('emprestimos as e')
      .join('produtos as p', 'e.produto_id', 'p.id')
      .where('e.id', req.params.id)
      .where('p.instituicao_id', req.instituicaoId)
      .select('e.*', 'p.quantidade_atual', 'p.nome as produto_nome')
      .first()

    if (!emprestimo) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' })
    }

    if (emprestimo.status === 'devolvido') {
      return res.status(400).json({ erro: 'Item já foi devolvido' })
    }

    const statusFinal = status || 'devolvido'
    const devolvido = statusFinal === 'devolvido'

    await db.transaction(async trx => {
      await trx('emprestimos').where({ id: req.params.id }).update({
        status: statusFinal,
        data_devolucao_efetiva: new Date(),
        observacoes: observacoes || emprestimo.observacoes,
        updated_at: new Date()
      })

      if (devolvido) {
        await trx('produtos').where({ id: emprestimo.produto_id }).update({
          quantidade_atual: emprestimo.quantidade_atual + 1,
          updated_at: new Date()
        })

        await trx('movimentacoes_estoque').insert({
          produto_id: emprestimo.produto_id,
          usuario_id: req.usuarioId,
          pessoa_id: emprestimo.pessoa_id,
          tipo: 'devolucao',
          quantidade: 1,
          motivo: 'Devolução de empréstimo',
          observacoes,
        })
      }
    })

    return res.json({ mensagem: `Item marcado como ${statusFinal} com sucesso` })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, registrar, devolver }