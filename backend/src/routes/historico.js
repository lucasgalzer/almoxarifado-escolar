const express = require('express')
const router = express.Router()
const { historicoPorProduto, historicoPorPessoa } = require('../controllers/historicoController')
const { autenticar } = require('../middlewares/auth')

router.get('/produto/:id', autenticar, historicoPorProduto)
router.get('/pessoa/:id', autenticar, historicoPorPessoa)

module.exports = router