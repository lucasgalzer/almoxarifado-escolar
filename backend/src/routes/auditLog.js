const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, autorizar('admin'), async (req, res, next) => {
  try {
    const logs = await db('audit_log as a')
      .leftJoin('usuarios as u', 'a.usuario_id', 'u.id')
      .where('a.instituicao_id', req.instituicaoId)
      .select(
        'a.id',
        'a.acao',
        'a.tabela_afetada',
        'a.registro_id',
        'a.dados_antes',
        'a.dados_depois',
        'a.created_at',
        'u.nome as usuario_nome'
      )
      .orderBy('a.created_at', 'desc')
      .limit(200)

    return res.json(logs)
  } catch (error) {
    next(error)
  }
})

module.exports = router