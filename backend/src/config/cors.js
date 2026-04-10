const corsOptions = {
  origin: function (origin, callback) {
    const permitidos = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ]

    if (!origin || permitidos.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Origem não permitida pelo CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

module.exports = corsOptions