const request = require("request");

module.exports = knex => {
	return () => {
		var apiGet = "http://api.translink.ca/rttiapi/v1/buses?apikey=iLKjRZhiqjH0r0claiVf";
		request({
			url: apiGet,
			method: "GET",
			timeout: 3000,
		  headers: {
		      Accept:'application/JSON'
		  }
		}, function(error, response, body) {
				if (error) {
					console.log(error);
				} else {
					const busses = JSON.parse(body);
					const rows = busses.map(function(bus) {
						return {
							"bus_id": bus.TripId,
							'long': bus.Longitude,
							'lat':	bus.Latitude,
							'recorded_time': bus.RecordedTime,
							'routeNo': bus.RouteNo,
							'direction': bus.Direction
						}
					});
					knex('bus')
					.del()
					.then(function() {
						return knex('bus')
						.insert(rows)
					})
				}
		});
	}
}
