const express = require('express')
const router = express.Router()
const { listarMovimentacoes, registrarMovimentacao } = require('../controllers/estoqueController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/movimentacoes', autenticar, listarMovimentacoes)
router.post('/movimentacoes', autenticar, autorizar('admin', 'operador'), registrarMovimentacao)

module.exports = router