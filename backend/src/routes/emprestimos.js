const express = require('express')
const router = express.Router()
const { listar, buscarPorId, registrar, devolver, devolverPorCodigo } = require('../controllers/emprestimosController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, autorizar('admin', 'operador'), registrar)
router.patch('/:id/devolver', autenticar, autorizar('admin', 'operador'), devolver)
router.post('/devolver-por-codigo', autenticar, autorizar('admin', 'operador'), devolverPorCodigo)

module.exports = router