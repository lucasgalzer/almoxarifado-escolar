exports.up = function(knex) {
  return knex.schema.table('instituicoes', function(table) {
    table.string('cor_primaria').defaultTo('#7eb82c')
    table.string('cor_secundaria').defaultTo('#2b3742')
    table.string('logo_url').nullable()
    table.string('nome_exibicao').nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.table('instituicoes', function(table) {
    table.dropColumn('cor_primaria')
    table.dropColumn('cor_secundaria')
    table.dropColumn('logo_url')
    table.dropColumn('nome_exibicao')
  })
}