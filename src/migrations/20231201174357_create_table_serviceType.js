exports.up = (knex) => knex.schema.createTable('serviceTypes', (t) => {
  t.increments('id').primary();
  t.string('name').notNull();
});

exports.down = (knex) => knex.schema.dropTable('serviceTypes');
