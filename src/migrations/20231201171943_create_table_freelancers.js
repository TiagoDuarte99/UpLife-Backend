exports.up = (knex) => knex.schema.createTable('freelancers', (t) => {
  t.increments('id').primary();
  t.integer('userId').notNull().references('users.id');
  t.string('firstName').notNull();
  t.string('lastName').notNull();
  t.string('address');
  t.date('birthdate').notNull();
  t.string('phoneNumber');
  t.text('description');
  t.integer('districtId').references('districts.id');
  t.integer('countyId').references('countys.id');
  t.string('photo');
  t.unique('userId');
});

exports.down = (knex) => knex.schema.dropTable('freelancers');
