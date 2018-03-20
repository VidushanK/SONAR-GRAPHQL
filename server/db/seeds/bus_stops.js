const busData = require('../JSON/stops')

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('bus_stops').del()
    .then(() => {
      let busPromises = [];
      busData.forEach((stop) => {
        busPromises.push(createStops(knex, stop));
      });
      return Promise.all(busPromises);
    });
};

const createStops = (knex, stop) => {
  return knex('bus_stops').insert({
    stop_number: stop.stop_code,
    long: stop.long,
    lat: stop.lat,
    routes: stop.stop_id
  })
};
