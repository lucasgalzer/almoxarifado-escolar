exports.up = function(knex) {
  return knex.schema.createTable('pessoas', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('instituicao_id').references('id').inTable('instituicoes').onDelete('CASCADE')
    table.string('nome_completo').notNullable()
    table.string('matricula')
    table.string('email')
    table.string('setor')
    table.string('cargo')
    table.string('telefone')
    table.boolean('ativo').defaultTo(true)
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('pessoas')
}