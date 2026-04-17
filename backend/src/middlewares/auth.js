const jwt = require('jsonwebtoken')
const db = require('../config/database')

async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não informado' })
  }

  const [, token] = authHeader.split(' ')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuarioId = decoded.id
    req.usuarioPerfil = decoded.perfil
    req.instituicaoId = decoded.instituicao_id
    req.superAdmin = decoded.super_admin
    req.acessandoComo = decoded.acessando_como

    // Super admin puro não precisa verificar instituição
    if (decoded.super_admin) return next()

    // Acessando como escola pelo super admin — não bloqueia
    if (decoded.acessando_como) return next()

    // Verifica se a instituição está ativa
    if (decoded.instituicao_id) {
      const instituicao = await db('instituicoes')
        .where({ id: decoded.instituicao_id })
        .select('ativo')
        .first()

      if (!instituicao || !instituicao.ativo) {
        return res.status(403).json({ erro: 'Instituição desativada. Entre em contato com o suporte.' })
      }
    }

    return next()
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}

function autorizar(...perfisPermitidos) {
  return function(req, res, next) {
    if (!perfisPermitidos.includes(req.usuarioPerfil)) {
      return res.status(403).json({ erro: 'Acesso negado' })
    }
    return next()
  }
}

module.exports = { autenticar, autorizar }