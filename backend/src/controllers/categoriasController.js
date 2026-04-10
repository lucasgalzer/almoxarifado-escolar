const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const categorias = await db('categorias')
      .where({ instituicao_id: req.instituicaoId })
      .orderBy('nome')

    return res.json(categorias)
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const categoria = await db('categorias')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' })
    }

    return res.json(categoria)
  } catch (error) {
    next(error)
  }
}

async function criar(req, res, next) {
  try {
    const { nome, descricao } = req.body

    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' })
    }

    const [categoria] = await db('categorias').insert({
      instituicao_id: req.instituicaoId,
      nome,
      descricao
    }).returning('*')

    return res.status(201).json(categoria)
  } catch (error) {
    next(error)
  }
}

async function atualizar(req, res, next) {
  try {
    const { nome, descricao } = req.body

    if (!nome) {
      return res.status(400).json({ erro: 'Nome é obrigatório' })
    }

    const [categoria] = await db('categorias')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .update({ nome, descricao, updated_at: new Date() })
      .returning('*')

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' })
    }

    return res.json(categoria)
  } catch (error) {
    next(error)
  }
}

async function excluir(req, res, next) {
  try {
    const categoria = await db('categorias')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' })
    }

    const produtos = await db('produtos')
      .where({ categoria_id: req.params.id })
      .count('id as total')
      .first()

    if (parseInt(produtos.total) > 0) {
      return res.status(400).json({ erro: 'Categoria possui produtos vinculados' })
    }

    await db('categorias')
      .where({ id: req.params.id })
      .delete()

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir }