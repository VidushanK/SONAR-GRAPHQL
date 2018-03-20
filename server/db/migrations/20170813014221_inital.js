
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('routes', (table) => {
      table.increments()
      table.string('route_number');
      table.string('destination');
      table.string('route_map');
      table.string('direction');
    }),
    knex.schema.createTable('bus_stops', (table) => {
      table.increments()
      table.string('stop_number');
      table.string('long');
      table.string('lat');
      table.string('routes')
    }),
    knex.schema.createTable('routes_bus_stops', (table) => {
      table.increments();
      table.integer('bus_stop_id').references('bus_stops.id');
      table.integer('route_id').references('routes.id');

    }),
    knex.schema.createTable('bus', (table) => {
      table.increments();
      table.string("bus_id");
      table.string('long');
      table.string('lat');
      table.string('recorded_time');
      table.string('routeNo');
      table.string('direction');
    })
  ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
    knex.raw('DROP TABLE routes CASCADE'),
    knex.raw('DROP TABLE bus_stops CASCADE'),
    knex.schema.dropTable('routes_bus_stops'),
    knex.schema.dropTable('bus')
  ]);
};
