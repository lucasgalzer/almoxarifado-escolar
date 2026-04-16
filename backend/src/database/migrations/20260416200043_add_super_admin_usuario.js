exports.up = function(knex) {
  return knex.schema.table('usuarios', function(table) {
    table.boolean('super_admin').defaultTo(false)
  })
}

exports.down = function(knex) {
  return knex.schema.table('usuarios', function(table) {
    table.dropColumn('super_admin')
  })
}