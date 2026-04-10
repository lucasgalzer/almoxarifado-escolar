const express = require('express')
const router = express.Router()
const { login, me } = require('../controllers/authController')
const { autenticar } = require('../middlewares/auth')

router.post('/login', login)
router.get('/me', autenticar, me)

module.exports = router