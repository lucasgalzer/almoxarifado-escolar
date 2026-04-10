const express = require('express')
const router = express.Router()
const { listar, buscarPorId, registrar, devolver } = require('../controllers/emprestimosController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, autorizar('admin', 'operador'), registrar)
router.patch('/:id/devolver', autenticar, autorizar('admin', 'operador'), devolver)

module.exports = router