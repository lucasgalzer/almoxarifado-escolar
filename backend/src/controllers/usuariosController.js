const db = require('../config/database')
const bcrypt = require('bcryptjs')
const { registrar } = require('../utils/auditLog')

async function listar(req, res, next) {
  try {
    const usuarios = await db('usuarios')
      .where({ instituicao_id: req.instituicaoId })
      .select('id', 'nome', 'email', 'perfil', 'ativo', 'created_at')
      .orderBy('nome')

    return res.json(usuarios)
  } catch (error) {
    next(error)
  }
}

async function criar(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body

    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' })
    if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório' })
    if (!senha) return res.status(400).json({ erro: 'Senha é obrigatória' })
    if (!perfil) return res.status(400).json({ erro: 'Perfil é obrigatório' })

    const perfilValido = ['admin', 'operador', 'solicitante']
    if (!perfilValido.includes(perfil)) {
      return res.status(400).json({ erro: 'Perfil inválido' })
    }

    const existe = await db('usuarios')
      .where({ email, instituicao_id: req.instituicaoId })
      .first()

    if (existe) {
      return res.status(409).json({ erro: 'E-mail já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const [usuario] = await db('usuarios').insert({
      instituicao_id: req.instituicaoId,
      nome,
      email,
      senha_hash: senhaHash,
      perfil,
      ativo: true,
    }).returning('id', 'nome', 'email', 'perfil', 'ativo', 'created_at')

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'USUARIO_CRIADO',
      tabela: 'usuarios',
      registro_id: usuario.id,
      dados_depois: { nome, email, perfil },
    })

    return res.status(201).json(usuario)
  } catch (error) {
    next(error)
  }
}

async function atualizar(req, res, next) {
  try {
    const { nome, email, perfil, ativo, senha } = req.body

    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' })
    if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório' })

    // Impede admin de se desativar
    if (req.params.id === req.usuarioId && ativo === false) {
      return res.status(400).json({ erro: 'Você não pode desativar sua própria conta' })
    }

    const updates = { nome, email, perfil, ativo, updated_at: new Date() }

    if (senha) {
      updates.senha_hash = await bcrypt.hash(senha, 10)
    }

    const [usuario] = await db('usuarios')
      .where({ id: req.params.id, instituicao_id: req.instituicaoId })
      .update(updates)
      .returning('id', 'nome', 'email', 'perfil', 'ativo')

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' })
    }

    await registrar(null, {
      usuario_id: req.usuarioId,
      instituicao_id: req.instituicaoId,
      acao: 'USUARIO_ATUALIZADO',
      tabela: 'usuarios',
      registro_id: usuario.id,
      dados_depois: { nome, email, perfil, ativo },
    })

    return res.json(usuario)
  } catch (error) {
    next(error)
  }
}

async function alterarSenha(req, res, next) {
  try {
    const { senha_atual, nova_senha } = req.body

    if (!senha_atual) return res.status(400).json({ erro: 'Senha atual é obrigatória' })
    if (!nova_senha) return res.status(400).json({ erro: 'Nova senha é obrigatória' })
    if (nova_senha.length < 6) return res.status(400).json({ erro: 'Nova senha deve ter pelo menos 6 caracteres' })

    const usuario = await db('usuarios').where({ id: req.usuarioId }).first()

    const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha_hash)
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Senha atual incorreta' })
    }

    await db('usuarios').where({ id: req.usuarioId }).update({
      senha_hash: await bcrypt.hash(nova_senha, 10),
      updated_at: new Date()
    })

    return res.json({ mensagem: 'Senha alterada com sucesso' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, criar, atualizar, alterarSenha }