exports.up = function(knex) {
  return knex.schema.createTable('emprestimos', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('produto_id').references('id').inTable('produtos').onDelete('CASCADE')
    table.uuid('pessoa_id').references('id').inTable('pessoas').onDelete('CASCADE')
    table.uuid('operador_id').references('id').inTable('usuarios').onDelete('SET NULL').nullable()
    table.enum('status', ['emprestado', 'devolvido', 'atrasado', 'perdido', 'danificado']).defaultTo('emprestado')
    table.timestamp('data_retirada').defaultTo(knex.fn.now())
    table.timestamp('data_devolucao_prevista')
    table.timestamp('data_devolucao_efetiva')
    table.text('observacoes')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('emprestimos')
}