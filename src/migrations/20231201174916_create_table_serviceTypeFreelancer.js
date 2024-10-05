exports.up = (knex) => knex.schema.createTable('freelancerServices', (t) => {
  t.integer('freelancerId').notNull().references('freelancers.id');
  t.integer('serviceTypeId').notNull().references('serviceTypes.id');
  t.decimal('pricePerHour', 10, 2).notNull();
  t.primary(['freelancerId', 'serviceTypeId']);
});

exports.down = (knex) => knex.schema.dropTable('freelancerServices');
