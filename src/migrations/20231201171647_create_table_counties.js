exports.up = (knex) => knex.schema.createTable('countys', (t) => {
  t.increments('id').primary();
  t.integer('districtId').notNull().references('districts.id');
  t.string('name').notNull();
});

exports.down = (knex) => knex.schema.dropTable('countys');
