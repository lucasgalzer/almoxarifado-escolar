const db = require('../config/database')
const { registrar } = require('../utils/auditLog')

async function listar(req, res, next) {
  try {
    const { categoria_id, status, tipo, busca } = req.query

    let query = db('produtos as p')
      .leftJoin('categorias as c', 'p.categoria_id', 'c.id')
      .where('p.instituicao_id', req.instituicaoId)
      .select('p.*', 'c.nome as categoria_nome')
      .orderBy('p.nome')

    if (categoria_id) query = query.where('p.categoria_id', categoria_id)
    if (status) query = query.where('p.status', status)
    if (tipo) query = query.where('p.tipo', tipo)
    if (busca) query = query.whereILike('p.nome', `%${busca}%`)

    const produtos = await query
    return res.json(produtos)
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const produto = await db('produtos as p')
      .leftJoin('categorias as c', 'p.categoria_id', 'c.id')
      .where('p.id', req.params.id)
      .where('p.instituicao_id', req.instituicaoId)
      .select('p.*', 'c.nome as categoria_nome')
      .first()

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    return res.json(produto)
  } catch (error) {
    next(error)
  }
}

async function criar(req, res, next) {
  try {
    const {
      codigo_interno, nome, descricao, categoria_id,
      unidade_medida, tipo, quantidade_atual,
      quantidade_minima, localizacao_fisica, observacoes
    } = req.body

    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' })
    if (!tipo) return res.status(400).json({ erro: 'Tipo é obrigatório' })
    if (!codigo_interno) return res.status(400).json({ erro: 'Código interno é obrigatório' })

    const codigoExiste = await db('produtos')
      .where({ codigo_interno, instituicao_id: req.instituicaoId })
      .first()

    if (codigoExiste) {
      return res.status(409).json({ erro: 'Código interno já cadastrado' })
    }

    const [produto] = await db('produtos').insert({
      instituicao_id: req.instituicaoId,
      codigo_interno,
      nome,
      descricao,
      categoria_id: categoria_id || null,
      unidade_medida: unidade_medida || 'un',
      tipo,
      quantidade_atual: quantidade_atual || 0,
      quantidade_minima: quantidade_minima || 0,
      localizacao_fisica,
      observacoes,
      status: 'disponivel'
    }).returning('*')

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PRODUTO_CRIADO',
      tabela: 'produtos',
      registro_id: produto.id,
      dados_depois: produto,
    })

    return res.status(201).json(produto)
  } catch (error) {
    next(error)
  }
}

async function atualizar(req, res, next) {
  try {
    const {
      codigo_interno, nome, descricao, categoria_id,
      unidade_medida, tipo, quantidade_minima,
      localizacao_fisica, status, observacoes
    } = req.body

    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' })
    if (!tipo) return res.status(400).json({ erro: 'Tipo é obrigatório' })

    const [produto] = await db('produtos')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .update({
        codigo_interno,
        nome,
        descricao,
        categoria_id: categoria_id || null,
        unidade_medida,
        tipo,
        quantidade_minima,
        localizacao_fisica,
        status,
        observacoes,
        updated_at: new Date()
      }).returning('*')

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PRODUTO_ATUALIZADO',
      tabela: 'produtos',
      registro_id: produto.id,
      dados_depois: produto,
    })

    return res.json(produto)
  } catch (error) {
    next(error)
  }
}

async function excluir(req, res, next) {
  try {
    const produto = await db('produtos')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' })
    }

    const emUso = await db('emprestimos')
      .where({ produto_id: req.params.id, status: 'emprestado' })
      .first()

    if (emUso) {
      return res.status(400).json({ erro: 'Produto possui empréstimo ativo' })
    }

    await db('produtos').where({ id: req.params.id }).delete()

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PRODUTO_EXCLUIDO',
      tabela: 'produtos',
      registro_id: req.params.id,
      dados_antes: produto,
    })

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir }