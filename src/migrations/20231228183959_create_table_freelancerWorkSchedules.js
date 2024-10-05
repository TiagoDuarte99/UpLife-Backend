exports.up = (knex) => knex.schema.createTable('FreelancerWorkSchedules', (t) => {
  t.increments('id').primary();
  t.integer('freelancerId').notNull().references('freelancers.id');
  t.date('date').notNull();
  t.time('startTime').notNull();
  t.time('endTime').notNull();
});

exports.down = (knex) => knex.schema.dropTable('FreelancerWorkSchedules');
