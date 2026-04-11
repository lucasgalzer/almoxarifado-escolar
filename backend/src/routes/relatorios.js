const express = require('express')
const router = express.Router()
const { estoqueAtual, movimentacoes, emprestimos } = require('../controllers/relatoriosController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/estoque', autenticar, autorizar('admin', 'operador'), estoqueAtual)
router.get('/movimentacoes', autenticar, autorizar('admin', 'operador'), movimentacoes)
router.get('/emprestimos', autenticar, autorizar('admin', 'operador'), emprestimos)

module.exports = router