
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('live_bus', (table) => {
      table.increments()
      table.json('LiveBus');
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('live_bus')
  ])
};
