exports.up = function(knex) {
  return knex.schema.createTable('manutencoes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('produto_id').references('id').inTable('produtos').onDelete('CASCADE')
    table.uuid('responsavel_id').references('id').inTable('usuarios').onDelete('SET NULL').nullable()
    table.string('tipo_problema')
    table.text('descricao_defeito')
    table.string('fornecedor_tecnico')
    table.enum('status', ['aguardando', 'em_conserto', 'consertado', 'descartado']).defaultTo('aguardando')
    table.timestamp('data_abertura').defaultTo(knex.fn.now())
    table.timestamp('data_envio')
    table.timestamp('data_previsao_retorno')
    table.timestamp('data_encerramento')
    table.decimal('custo_estimado', 10, 2)
    table.decimal('custo_real', 10, 2)
    table.text('observacoes')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('manutencoes')
}