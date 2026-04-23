exports.up = function(knex) {
  return knex.schema.table('emprestimos_fixos', function(table) {
    table.string('sala').nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.table('emprestimos_fixos', function(table) {
    table.dropColumn('sala')
  })
}