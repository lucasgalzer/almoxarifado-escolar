function tratarErros(err, req, res, next) {
  console.error(`[ERRO] ${req.method} ${req.path}`, err.message)

  if (err.message === 'Origem não permitida pelo CORS') {
    return res.status(403).json({ erro: 'Acesso não permitido' })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ erro: err.message })
  }

  if (err.code === '23505') {
    return res.status(409).json({ erro: 'Registro duplicado' })
  }

  if (err.code === '23503') {
    return res.status(400).json({ erro: 'Referência inválida' })
  }

  return res.status(500).json({
    erro: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Erro interno do servidor'
  })
}

function rotaNaoEncontrada(req, res) {
  return res.status(404).json({ erro: `Rota ${req.method} ${req.path} não encontrada` })
}

module.exports = { tratarErros, rotaNaoEncontrada }