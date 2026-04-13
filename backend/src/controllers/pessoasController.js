const db = require('../config/database')
const { registrar } = require('../utils/auditLog')

async function listar(req, res, next) {
  try {
    const { setor, ativo, busca } = req.query

    let query = db('pessoas')
      .where({ instituicao_id: req.instituicaoId })
      .orderBy('nome_completo')

    if (setor) query = query.where({ setor })
    if (ativo !== undefined) query = query.where({ ativo: ativo === 'true' })
    if (busca) query = query.whereILike('nome_completo', `%${busca}%`)

    const pessoas = await query
    return res.json(pessoas)
  } catch (error) {
    next(error)
  }
}

async function buscarPorId(req, res, next) {
  try {
    const pessoa = await db('pessoas')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!pessoa) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' })
    }

    return res.json(pessoa)
  } catch (error) {
    next(error)
  }
}

async function criar(req, res, next) {
  try {
    const { nome_completo, matricula, email, setor, cargo, telefone } = req.body

    if (!nome_completo) {
      return res.status(400).json({ erro: 'Nome completo é obrigatório' })
    }

    if (matricula) {
      const existe = await db('pessoas')
        .where({ matricula, instituicao_id: req.instituicaoId })
        .first()

      if (existe) {
        return res.status(409).json({ erro: 'Matrícula já cadastrada' })
      }
    }

    const [pessoa] = await db('pessoas').insert({
      instituicao_id: req.instituicaoId,
      nome_completo,
      matricula,
      email,
      setor,
      cargo,
      telefone,
      ativo: true
    }).returning('*')

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PESSOA_CRIADA',
      tabela: 'pessoas',
      registro_id: pessoa.id,
      dados_depois: pessoa,
    })

    return res.status(201).json(pessoa)
  } catch (error) {
    next(error)
  }
}

async function atualizar(req, res, next) {
  try {
    const { nome_completo, matricula, email, setor, cargo, telefone, ativo } = req.body

    if (!nome_completo) {
      return res.status(400).json({ erro: 'Nome completo é obrigatório' })
    }

    const [pessoa] = await db('pessoas')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .update({
        nome_completo, matricula, email,
        setor, cargo, telefone, ativo,
        updated_at: new Date()
      }).returning('*')

    if (!pessoa) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' })
    }

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'PESSOA_ATUALIZADA',
      tabela: 'pessoas',
      registro_id: pessoa.id,
      dados_depois: pessoa,
    })

    return res.json(pessoa)
  } catch (error) {
    next(error)
  }
}

async function listarSetores(req, res, next) {
  try {
    const setores = await db('pessoas')
      .where({ instituicao_id: req.instituicaoId })
      .whereNotNull('setor')
      .distinct('setor')
      .orderBy('setor')
      .pluck('setor')

    return res.json(setores)
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, listarSetores }