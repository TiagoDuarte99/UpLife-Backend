exports.up = (knex) => knex.schema.createTable('schedulings', (t) => {
  t.increments('id').primary();
  t.integer('clientId').notNull().references('clients.id');
  t.integer('freelancerId').notNull().references('freelancers.id');
  t.integer('typeServiceId').notNull().references('serviceTypes.id');
  t.json('scheduleDetails').notNull();
  t.date('dateScheduling').notNull();
  t.time('startTime').notNull();
  t.time('endTime').notNull();
  t.integer('districtId').notNull().references('districts.id');
  t.integer('countyId').notNull().references('countys.id');
  t.string('address');
  t.string('postalCode');
});
exports.down = (knex) => knex.schema.dropTable('schedulings');
