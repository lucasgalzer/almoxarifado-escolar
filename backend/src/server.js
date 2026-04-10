const express = require('express')
const cors = require('cors')
require('dotenv').config()

const db = require('./config/database')
const authRoutes = require('./routes/auth')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)

app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1')
    res.json({ status: 'ok', banco: 'conectado', timestamp: new Date() })
  } catch (error) {
    res.status(500).json({ status: 'erro', banco: 'desconectado', erro: error.message })
  }
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})