exports.up = function(knex) {
  return knex.schema.createTable('categorias', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('instituicao_id').references('id').inTable('instituicoes').onDelete('CASCADE')
    table.string('nome').notNullable()
    table.string('descricao')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('categorias')
}