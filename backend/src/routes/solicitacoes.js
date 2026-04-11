const express = require('express')
const router = express.Router()
const { listar, buscarPorId, criar, atualizarStatus } = require('../controllers/solicitacoesController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, criar)
router.patch('/:id/status', autenticar, autorizar('admin', 'operador'), atualizarStatus)

module.exports = router