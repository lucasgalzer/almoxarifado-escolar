const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { autenticar, autorizar } = require('../middlewares/auth')

// Listar empréstimos fixos
router.get('/', autenticar, async (req, res, next) => {
  try {
    const { pessoa_id, status } = req.query

    let query = db('emprestimos_fixos as ef')
      .join('pessoas as pe', 'ef.pessoa_id', 'pe.id')
      .join('produtos as p', 'ef.produto_id', 'p.id')
      .leftJoin('usuarios as u', 'ef.usuario_id', 'u.id')
      .where('ef.instituicao_id', req.instituicaoId)
      .select(
        'ef.*',
        'ef.sala',
        'pe.nome_completo as pessoa_nome',
        'pe.setor as pessoa_setor',
        'pe.email as pessoa_email',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'p.localizacao_fisica',
        'u.nome as usuario_nome'
      )
      .orderBy('pe.nome_completo')

    if (pessoa_id) query = query.where('ef.pessoa_id', pessoa_id)
    if (status) query = query.where('ef.status', status)

    const emprestimos = await query
    return res.json(emprestimos)
  } catch (error) {
    next(error)
  }
})

// Registrar empréstimo fixo
router.post('/', autenticar, autorizar('admin', 'operador'), async (req, res, next) => {
  try {
    const { pessoa_id, produto_id, data_inicio, observacoes, sala } = req.body

    if (!pessoa_id) return res.status(400).json({ erro: 'Pessoa é obrigatória' })
    if (!produto_id) return res.status(400).json({ erro: 'Produto é obrigatório' })
    if (!sala) return res.status(400).json({ erro: 'Sala é obrigatória' })

    const jaExiste = await db('emprestimos_fixos')
      .where({ produto_id, status: 'ativo' })
      .first()

    if (jaExiste) {
      return res.status(400).json({ erro: 'Este produto já possui um empréstimo fixo ativo' })
    }

    const produto = await db('produtos')
      .where({ id: produto_id, instituicao_id: req.instituicaoId })
      .first()

    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' })
    if (produto.status !== 'disponivel') {
      return res.status(400).json({ erro: `Produto está ${produto.status}` })
    }

    const [emprestimo] = await db.transaction(async trx => {
      await trx('produtos')
        .where({ id: produto_id })
        .update({ status: 'indisponivel', updated_at: new Date() })

      return trx('emprestimos_fixos').insert({
        instituicao_id: req.instituicaoId,
        pessoa_id,
        produto_id,
        usuario_id: req.usuarioId,
        data_inicio: data_inicio || new Date(),
        sala,
        observacoes,
        status: 'ativo',
      }).returning('*')
    })

    return res.status(201).json(emprestimo)
  } catch (error) {
    next(error)
  }
})

// Encerrar empréstimo fixo
router.patch('/:id/encerrar', autenticar, autorizar('admin', 'operador'), async (req, res, next) => {
  try {
    const emprestimo = await db('emprestimos_fixos')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .first()

    if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado' })
    if (emprestimo.status === 'encerrado') return res.status(400).json({ erro: 'Empréstimo já encerrado' })

    await db.transaction(async trx => {
      await trx('emprestimos_fixos')
        .where({ id: req.params.id })
        .update({ status: 'encerrado', data_fim: new Date(), updated_at: new Date() })

      await trx('produtos')
        .where({ id: emprestimo.produto_id })
        .update({ status: 'disponivel', updated_at: new Date() })
    })

    return res.json({ mensagem: 'Empréstimo fixo encerrado com sucesso' })
  } catch (error) {
    next(error)
  }
})

// Buscar por pessoa
router.get('/pessoa/:pessoaId', autenticar, async (req, res, next) => {
  try {
    const emprestimos = await db('emprestimos_fixos as ef')
      .join('produtos as p', 'ef.produto_id', 'p.id')
      .leftJoin('usuarios as u', 'ef.usuario_id', 'u.id')
      .where({ 'ef.pessoa_id': req.params.pessoaId, 'ef.instituicao_id': req.instituicaoId, 'ef.status': 'ativo' })
      .select(
        'ef.*',
        'ef.sala',
        'p.nome as produto_nome',
        'p.codigo_interno',
        'p.localizacao_fisica',
        'u.nome as usuario_nome'
      )
      .orderBy('ef.data_inicio')

    return res.json(emprestimos)
  } catch (error) {
    next(error)
  }
})

module.exports = router