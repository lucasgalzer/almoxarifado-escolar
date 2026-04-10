const jwt = require('jsonwebtoken')

function autenticar(req, res, next) {
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