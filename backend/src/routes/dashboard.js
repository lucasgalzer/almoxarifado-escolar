const express = require('express')
const router = express.Router()
const { indicadores } = require('../controllers/dashboardController')
const { autenticar } = require('../middlewares/auth')

router.get('/indicadores', autenticar, indicadores)

module.exports = router

