const express = require('express')
const router = express.Router()
const { listar, buscarPorId, criar, atualizar, excluir } = require('../controllers/categoriasController')
const { autenticar, autorizar } = require('../middlewares/auth')
const db = require('../config/database')

router.get('/', autenticar, listar)
router.get('/:id', autenticar, buscarPorId)
router.post('/', autenticar, autorizar('admin', 'operador'), criar)
router.put('/:id', autenticar, autorizar('admin', 'operador'), atualizar)
router.delete('/:id', autenticar, autorizar('admin'), excluir)

// Campos da categoria
router.get('/:categoriaId/campos', autenticar, async (req, res, next) => {
  try {
    const campos = await db('campos_categoria')
      .where({ categoria_id: req.params.categoriaId })
      .orderBy('ordem')
    return res.json(campos)
  } catch (error) {
    next(error)
  }
})

router.put('/:categoriaId/campos', autenticar, autorizar('admin'), async (req, res, next) => {
  try {
    const { campos } = req.body

    await db('campos_categoria')
      .where({ categoria_id: req.params.categoriaId })
      .delete()

    if (campos && campos.length > 0) {
      const inserir = campos.map((c, i) => ({
        categoria_id: req.params.categoriaId,
        nome: c.nome,
        label: c.label,
        tipo: c.tipo || 'texto',
        opcoes: c.opcoes ? JSON.stringify(c.opcoes) : null,
        obrigatorio: c.obrigatorio || false,
        ordem: i,
      }))
      await db('campos_categoria').insert(inserir)
    }

    const camposAtualizados = await db('campos_categoria')
      .where({ categoria_id: req.params.categoriaId })
      .orderBy('ordem')

    return res.json(camposAtualizados)
  } catch (error) {
    next(error)
  }
})

module.exports = router