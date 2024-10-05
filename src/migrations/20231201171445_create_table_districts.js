exports.up = async (knex) => {
  await knex.schema.createTable('districts', (t) => {
    t.increments('id').primary();
    t.string('name').notNull();
  });
};

exports.down = (knex) => knex.schema.dropTable('districts');
