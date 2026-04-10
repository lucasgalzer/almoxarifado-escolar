exports.up = function(knex) {
  return knex.schema.createTable('produtos', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('instituicao_id').references('id').inTable('instituicoes').onDelete('CASCADE')
    table.uuid('categoria_id').references('id').inTable('categorias').onDelete('SET NULL').nullable()
    table.string('codigo_interno').notNullable()
    table.string('nome').notNullable()
    table.string('descricao')
    table.string('unidade_medida').defaultTo('un')
    table.enum('tipo', ['consumivel', 'reutilizavel']).notNullable()
    table.integer('quantidade_atual').defaultTo(0)
    table.integer('quantidade_minima').defaultTo(0)
    table.string('localizacao_fisica')
    table.enum('status', ['disponivel', 'indisponivel', 'em_manutencao']).defaultTo('disponivel')
    table.text('observacoes')
    table.timestamps(true, true)
  })
}
exports.down = function(knex) {
  return knex.schema.dropTable('produtos')
}