exports.up = function(knex) {
  return knex.schema.createTable('usuarios', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('instituicao_id').references('id').inTable('instituicoes').onDelete('CASCADE')
    table.string('nome').notNullable()
    table.string('email').notNullable().unique()
    table.string('senha_hash').notNullable()
    table.enum('perfil', ['admin', 'operador', 'solicitante']).defaultTo('solicitante')
    table.boolean('ativo').defaultTo(true)
    table.timestamp('ultimo_login')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('usuarios')
}