exports.up = (knex) => knex.schema.createTable('users', (t) => {
  t.increments('id').primary();
  t.string('email').notNull().unique();
  t.string('password').notNull();
  t.timestamp('lastTimeLogin');
  t.boolean('active').notNull().defaultTo(true).checkIn(['true', 'false']);
});

exports.down = (knex) => knex.schema.dropTable('users');
