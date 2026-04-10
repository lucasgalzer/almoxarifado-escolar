exports.up = function(knex) {
  return knex.schema.createTable('instituicoes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('nome').notNullable()
    table.string('cnpj').unique()
    table.string('email')
    table.string('telefone')
    table.string('plano').defaultTo('basico')
    table.boolean('ativo').defaultTo(true)
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('instituicoes')
}