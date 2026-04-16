const express = require('express')
const router = express.Router()
const { listar, criar, atualizar, alterarSenha } = require('../controllers/usuariosController')
const { autenticar, autorizar } = require('../middlewares/auth')

router.get('/', autenticar, autorizar('admin'), listar)
router.post('/', autenticar, autorizar('admin'), criar)
router.put('/:id', autenticar, autorizar('admin'), atualizar)
router.patch('/alterar-senha', autenticar, alterarSenha)

module.exports = router