exports.up = (knex) => knex.schema.createTable('clients', (t) => {
  t.increments('id').primary();
  t.integer('userId').notNull().references('users.id');
  t.string('firstName').notNull();
  t.string('lastName').notNull();
  t.date('birthdate').notNull();
  t.integer('districtId').references('districts.id');
  t.integer('countyId').references('countys.id');
  t.string('address');
  t.string('phoneNumber');
  t.string('photo');
  t.unique('userId');
});

exports.down = (knex) => knex.schema.dropTable('clients');
