const express = require('express')
const router = express.Router()
const multer = require('multer')
const { importarProdutos } = require('../controllers/importacaoController')
const { autenticar, autorizar } = require('../middlewares/auth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.originalname.endsWith('.csv')) {
      return cb(new Error('Apenas arquivos .csv são permitidos'))
    }
    cb(null, true)
  }
})

router.post('/produtos', autenticar, autorizar('admin', 'operador'), upload.single('arquivo'), importarProdutos)

module.exports = router