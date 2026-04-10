const bcrypt = require('bcryptjs')

exports.seed = async function(knex) {
  await knex('usuarios').del()
  await knex('instituicoes').del()

  const [instituicao] = await knex('instituicoes').insert({
    nome: 'Escola Teste',
    email: 'escola@teste.com',
    plano: 'basico',
    ativo: true
  }).returning('*')

  const senha_hash = await bcrypt.hash('123456', 10)

  await knex('usuarios').insert({
    instituicao_id: instituicao.id,
    nome: 'Administrador',
    email: 'admin@escola.com',
    senha_hash,
    perfil: 'admin',
    ativo: true
  })
}