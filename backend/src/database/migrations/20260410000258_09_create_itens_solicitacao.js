exports.up = function(knex) {
  return knex.schema.createTable('itens_solicitacao', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('solicitacao_id').references('id').inTable('solicitacoes').onDelete('CASCADE')
    table.uuid('produto_id').references('id').inTable('produtos').onDelete('CASCADE')
    table.integer('quantidade_solicitada').notNullable()
    table.integer('quantidade_aprovada')
    table.text('observacoes')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('itens_solicitacao')
}