exports.up = function(knex) {
  return knex.schema.createTable('audit_log', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('usuario_id').references('id').inTable('usuarios').onDelete('SET NULL').nullable()
    table.uuid('instituicao_id').references('id').inTable('instituicoes').onDelete('CASCADE')
    table.string('acao').notNullable()
    table.string('tabela_afetada')
    table.uuid('registro_id')
    table.jsonb('dados_antes')
    table.jsonb('dados_depois')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('audit_log')
}