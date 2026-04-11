const express = require('express')
const router = express.Router()
const { listar, buscarPorId, abrir, atualizarStatus } = require('../controllers/manutencoesController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, autorizar('admin', 'operador'), abrir)
router.patch('/:id/status', autenticar, autorizar('admin', 'operador'), atualizarStatus)

module.exports = router