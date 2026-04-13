const db = require('../config/database')

async function registrar(trx, { usuario_id, instituicao_id, acao, tabela, registro_id, dados_antes, dados_depois }) {
  try {
    const query = trx || db
    await query('audit_log').insert({
      usuario_id,
      instituicao_id,
      acao,
      tabela_afetada: tabela,
      registro_id: registro_id || null,
      dados_antes: dados_antes ? JSON.stringify(dados_antes) : null,
      dados_depois: dados_depois ? JSON.stringify(dados_depois) : null,
    })
  } catch (error) {
    console.error('[AUDIT LOG ERROR]', error.message)
  }
}

module.exports = { registrar }