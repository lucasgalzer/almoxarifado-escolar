const express = require('express')
const cors = require('cors')
require('dotenv').config()

const db = require('./config/database')
const corsOptions = require('./config/cors')
const { tratarErros, rotaNaoEncontrada } = require('./middlewares/erros')
const authRoutes = require('./routes/auth')
const categoriasRoutes = require('./routes/categorias') 
const produtosRoutes = require('./routes/produtos')
const importacaoRoutes = require('./routes/importacao')
const pessoasRoutes = require('./routes/pessoas')
const estoqueRoutes = require('./routes/estoque')
const dashboardRoutes = require('./routes/dashboard')
const emprestimosRoutes = require('./routes/emprestimos')
const historicoRoutes = require('./routes/historico')
const solicitacoesRoutes = require('./routes/solicitacoes')
const manutencoesRoutes = require('./routes/manutencoes')
const relatoriosRoutes = require('./routes/relatorios')

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1')
    res.json({
      status: 'ok',
      banco: 'conectado',
      ambiente: process.env.NODE_ENV,
      timestamp: new Date()
    })
  } catch (error) {
    res.status(500).json({ status: 'erro', banco: 'desconectado', erro: error.message })
  }
})

app.use('/auth', authRoutes)
app.use('/categorias', categoriasRoutes)
app.use('/produtos', produtosRoutes)
app.use('/importacao', importacaoRoutes)
app.use('/pessoas', pessoasRoutes)
app.use('/estoque', estoqueRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/emprestimos', emprestimosRoutes)
app.use('/historico', historicoRoutes)
app.use('/solicitacoes', solicitacoesRoutes)
app.use('/manutencoes', manutencoesRoutes)
app.use('/relatorios', relatoriosRoutes)

app.use(rotaNaoEncontrada)
app.use(tratarErros)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`)
})