exports.up = function(knex) {
  return knex.schema.createTable('solicitacoes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('instituicao_id').references('id').inTable('instituicoes').onDelete('CASCADE')
    table.uuid('solicitante_id').references('id').inTable('usuarios').onDelete('CASCADE')
    table.uuid('operador_id').references('id').inTable('usuarios').onDelete('SET NULL').nullable()
    table.enum('status', ['pendente', 'aprovada', 'pronta', 'entregue', 'recusada', 'cancelada']).defaultTo('pendente')
    table.timestamp('data_desejada')
    table.string('finalidade')
    table.text('observacoes')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('solicitacoes')
}