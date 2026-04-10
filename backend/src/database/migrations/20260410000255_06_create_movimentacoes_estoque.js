exports.up = function(knex) {
  return knex.schema.createTable('movimentacoes_estoque', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('produto_id').references('id').inTable('produtos').onDelete('CASCADE')
    table.uuid('usuario_id').references('id').inTable('usuarios').onDelete('SET NULL').nullable()
    table.uuid('pessoa_id').references('id').inTable('pessoas').onDelete('SET NULL').nullable()
    table.enum('tipo', ['entrada', 'saida', 'ajuste', 'devolucao']).notNullable()
    table.integer('quantidade').notNullable()
    table.string('motivo')
    table.text('observacoes')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('movimentacoes_estoque')
}