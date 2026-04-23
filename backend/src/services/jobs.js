const cron = require('node-cron')
const db = require('../config/database')
const { enviarEmailEmprestimoPendente } = require('./email')

function iniciarJobs() {
  // Roda todo dia às 8h da manhã
  cron.schedule('0 8 * * *', async () => {
    console.log('[JOB] Verificando empréstimos pendentes...')

    try {
      const ontem = new Date()
      ontem.setDate(ontem.getDate() - 1)
      ontem.setHours(0, 0, 0, 0)

      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      // Busca empréstimos feitos ontem que ainda estão abertos
      const emprestimos = await db('emprestimos as e')
        .join('produtos as p', 'e.produto_id', 'p.id')
        .join('pessoas as pe', 'e.pessoa_id', 'pe.id')
        .join('instituicoes as i', 'p.instituicao_id', 'i.id')
        .where('e.status', 'emprestado')
        .whereBetween('e.data_retirada', [ontem, hoje])
        .whereNotNull('pe.email')
        .select(
          'e.id',
          'e.data_retirada',
          'p.nome as produto_nome',
          'p.codigo_interno',
          'pe.nome_completo as pessoa_nome',
          'pe.email as pessoa_email',
          'i.nome as instituicao_nome'
        )

      console.log(`[JOB] ${emprestimos.length} empréstimo(s) pendente(s) encontrado(s)`)

      for (const emp of emprestimos) {
        try {
          await enviarEmailEmprestimoPendente({
            pessoa_nome: emp.pessoa_nome,
            pessoa_email: emp.pessoa_email,
            produto_nome: emp.produto_nome,
            codigo_interno: emp.codigo_interno,
            data_emprestimo: emp.data_retirada,
            instituicao_nome: emp.instituicao_nome,
          })
          console.log(`[JOB] Email enviado para ${emp.pessoa_email}`)
        } catch (err) {
          console.error(`[JOB] Erro ao enviar email para ${emp.pessoa_email}:`, err.message)
        }
      }
    } catch (error) {
      console.error('[JOB] Erro no job de empréstimos:', error)
    }
  }, {
    timezone: 'America/Sao_Paulo'
  })

  console.log('[JOB] Jobs iniciados')
}

module.exports = { iniciarJobs }