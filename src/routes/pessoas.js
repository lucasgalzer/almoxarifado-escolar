const express = require('express')
const router = express.Router()
const { listar, buscarPorId, criar, atualizar, listarSetores } = require('../controllers/pessoasController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/setores', autenticar, listarSetores)
router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, autorizar('admin', 'operador'), criar)
router.put('/:id', autenticar, autorizar('admin', 'operador'), atualizar)

module.exports = router