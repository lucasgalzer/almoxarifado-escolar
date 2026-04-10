const express = require('express')
const router = express.Router()
const { listar, buscarPorId, criar, atualizar, excluir } = require('../controllers/categoriasController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, autorizar('admin', 'operador'), criar)
router.put('/:id', autenticar, autorizar('admin', 'operador'), atualizar)
router.delete('/:id', autenticar, autorizar('admin'), excluir)

module.exports = router