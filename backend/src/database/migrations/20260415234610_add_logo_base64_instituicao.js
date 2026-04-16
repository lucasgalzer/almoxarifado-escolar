exports.up = function(knex) {
  return knex.schema.table('instituicoes', function(table) {
    table.text('logo_base64').nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.table('instituicoes', function(table) {
    table.dropColumn('logo_base64')
  })
}