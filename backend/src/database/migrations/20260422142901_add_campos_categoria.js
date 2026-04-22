exports.up = function(knex) {
  return knex.schema
    .createTable('campos_categoria', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('categoria_id').notNullable().references('id').inTable('categorias').onDelete('CASCADE')
      table.string('nome').notNullable()
      table.string('label').notNullable()
      table.enum('tipo', ['texto', 'numero', 'select', 'boolean']).defaultTo('texto')
      table.json('opcoes').nullable()
      table.boolean('obrigatorio').defaultTo(false)
      table.integer('ordem').defaultTo(0)
      table.timestamps(true, true)
    })
    .table('produtos', function(table) {
      table.json('campos_extras').nullable()
    })
}

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('campos_categoria')
    .table('produtos', function(table) {
      table.dropColumn('campos_extras')
    })
}