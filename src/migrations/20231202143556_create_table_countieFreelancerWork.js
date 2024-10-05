exports.up = (knex) => knex.schema.createTable('countysFreelancerWork', (t) => {
  t.integer('freelancerId').notNull().references('freelancers.id');
  t.integer('districtId').notNull().references('districts.id');
  t.integer('countyId').notNull().references('countys.id');
  t.primary(['freelancerId', 'countyId']);
});

exports.down = (knex) => knex.schema.dropTable('countysFreelancerWork');
