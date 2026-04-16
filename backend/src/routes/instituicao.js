const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, async (req, res, next) => {
  try {
    const instituicao = await db('instituicoes')
      .where({ id: req.instituicaoId })
      .select('id', 'nome', 'nome_exibicao', 'cor_primaria', 'cor_secundaria', 'logo_base64')
      .first()

    return res.json(instituicao)
  } catch (error) {
    next(error)
  }
})

router.put('/', autenticar, autorizar('admin'), async (req, res, next) => {
  try {
    const { nome_exibicao, cor_primaria, cor_secundaria, logo_base64 } = req.body

    const [instituicao] = await db('instituicoes')
      .where({ id: req.instituicaoId })
      .update({ nome_exibicao, cor_primaria, cor_secundaria, logo_base64 })
      .returning('id', 'nome', 'nome_exibicao', 'cor_primaria', 'cor_secundaria', 'logo_base64')

    return res.json(instituicao)
  } catch (error) {
    next(error)
  }
})

module.exports = router