const express = require('express')
const router = express.Router()
const db = require('../config/database')
const bcrypt = require('bcryptjs')
const { autenticar } = require('../middlewares/auth')

// Middleware para verificar se é super admin
async function superAdminOnly(req, res, next) {
  try {
    const usuario = await db('usuarios').where({ id: req.usuarioId }).first()
    if (!usuario?.super_admin) {
      return res.status(403).json({ erro: 'Acesso negado' })
    }
    next()
  } catch (error) {
    next(error)
  }
}

// Listar todas as instituições
router.get('/instituicoes', autenticar, superAdminOnly, async (req, res, next) => {
  try {
    const instituicoes = await db('instituicoes')
      .select('instituicoes.*')
      .orderBy('created_at', 'desc')

    const result = await Promise.all(instituicoes.map(async inst => {
      const totalUsuarios = await db('usuarios').where({ instituicao_id: inst.id }).count('id as total').first()
      const totalProdutos = await db('produtos').where({ instituicao_id: inst.id }).count('id as total').first()
      return {
        ...inst,
        total_usuarios: parseInt(totalUsuarios.total),
        total_produtos: parseInt(totalProdutos.total),
      }
    }))

    return res.json(result)
  } catch (error) {
    next(error)
  }
})

// Criar nova instituição
router.post('/instituicoes', autenticar, superAdminOnly, async (req, res, next) => {
  try {
    const { nome, email, cnpj, telefone, admin_email, admin_nome, admin_senha } = req.body

    if (!nome || !admin_email || !admin_nome || !admin_senha) {
      return res.status(400).json({ erro: 'Nome, email e senha do admin são obrigatórios' })
    }

    const emailExiste = await db('usuarios').where({ email: admin_email }).first()
    if (emailExiste) {
      return res.status(400).json({ erro: 'E-mail do administrador já está em uso' })
    }

    const [instituicao] = await db('instituicoes')
      .insert({ nome, email, cnpj, telefone })
      .returning('*')

    const senha_hash = await bcrypt.hash(admin_senha, 10)
    await db('usuarios').insert({
      instituicao_id: instituicao.id,
      nome: admin_nome,
      email: admin_email,
      senha_hash,
      perfil: 'admin',
      ativo: true,
    })

    return res.status(201).json(instituicao)
  } catch (error) {
    next(error)
  }
})

// Ativar/desativar instituição
router.patch('/instituicoes/:id/toggle', autenticar, superAdminOnly, async (req, res, next) => {
  try {
    const instituicao = await db('instituicoes').where({ id: req.params.id }).first()
    if (!instituicao) return res.status(404).json({ erro: 'Instituição não encontrada' })

    const [atualizada] = await db('instituicoes')
      .where({ id: req.params.id })
      .update({ ativo: !instituicao.ativo })
      .returning('*')

    return res.json(atualizada)
  } catch (error) {
    next(error)
  }
})

module.exports = router