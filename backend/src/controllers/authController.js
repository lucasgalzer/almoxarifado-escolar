const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')

async function login(req, res) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' })
    }

    const usuario = await db('usuarios')
      .where({ email, ativo: true })
      .first()

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' })
    }

    await db('usuarios').where({ id: usuario.id }).update({
      ultimo_login: new Date()
    })

  const token = jwt.sign(
  {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    instituicao_id: usuario.instituicao_id,
    super_admin: usuario.super_admin,
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
)
    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        instituicao_id: usuario.instituicao_id,
        super_admin: usuario.super_admin,
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function me(req, res) {
  try {
    const usuario = await db('usuarios')
      .where({ id: req.usuarioId })
      .select('id', 'nome', 'email', 'perfil', 'instituicao_id', 'super_admin')
      .first()

    return res.json(usuario)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

module.exports = { login, me }