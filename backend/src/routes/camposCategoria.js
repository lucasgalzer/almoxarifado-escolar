const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { autenticar, autorizar } = require('../middlewares/auth')

// Listar campos de uma categoria
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

// Criar campo
router.post('/:categoriaId/campos', autenticar, autorizar('admin'), async (req, res, next) => {
  try {
    const { nome, label, tipo, opcoes, obrigatorio, ordem } = req.body

    if (!nome || !label) {
      return res.status(400).json({ erro: 'Nome e label são obrigatórios' })
    }

    const [campo] = await db('campos_categoria')
      .insert({
        categoria_id: req.params.categoriaId,
        nome,
        label,
        tipo: tipo || 'texto',
        opcoes: opcoes ? JSON.stringify(opcoes) : null,
        obrigatorio: obrigatorio || false,
        ordem: ordem || 0,
      })
      .returning('*')

    return res.status(201).json(campo)
  } catch (error) {
    next(error)
  }
})

// Atualizar campo
router.put('/:categoriaId/campos/:id', autenticar, autorizar('admin'), async (req, res, next) => {
  try {
    const { nome, label, tipo, opcoes, obrigatorio, ordem } = req.body

    const [campo] = await db('campos_categoria')
      .where({ id: req.params.id, categoria_id: req.params.categoriaId })
      .update({
        nome, label, tipo,
        opcoes: opcoes ? JSON.stringify(opcoes) : null,
        obrigatorio, ordem,
        updated_at: new Date()
      })
      .returning('*')

    if (!campo) return res.status(404).json({ erro: 'Campo não encontrado' })
    return res.json(campo)
  } catch (error) {
    next(error)
  }
})

// Deletar campo
router.delete('/:categoriaId/campos/:id', autenticar, autorizar('admin'), async (req, res, next) => {
  try {
    await db('campos_categoria')
      .where({ id: req.params.id, categoria_id: req.params.categoriaId })
      .delete()
    return res.json({ mensagem: 'Campo removido' })
  } catch (error) {
    next(error)
  }
})

// Salvar todos os campos de uma vez (substituição completa)
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