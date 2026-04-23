exports.up = function(knex) {
  return knex.schema.createTable('emprestimos_fixos', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('instituicao_id').notNullable().references('id').inTable('instituicoes').onDelete('CASCADE')
    table.uuid('pessoa_id').notNullable().references('id').inTable('pessoas').onDelete('CASCADE')
    table.uuid('produto_id').notNullable().references('id').inTable('produtos').onDelete('CASCADE')
    table.uuid('usuario_id').nullable().references('id').inTable('usuarios')
    table.date('data_inicio').notNullable().defaultTo(knex.fn.now())
    table.date('data_fim').nullable()
    table.enum('status', ['ativo', 'encerrado']).defaultTo('ativo')
    table.text('observacoes').nullable()
    table.timestamps(true, true)
  })
}

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('emprestimos_fixos')
}