exports.up = function(knex) {
  return knex.schema.table('categorias', function(table) {
    table.enum('tipo_controle', ['quantidade', 'individual']).defaultTo('quantidade')
  })
}

exports.down = function(knex) {
  return knex.schema.table('categorias', function(table) {
    table.dropColumn('tipo_controle')
  })
}