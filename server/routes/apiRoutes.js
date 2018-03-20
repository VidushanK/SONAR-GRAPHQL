const express = require('express');
const router  = express.Router();

function createRoutes(knex) {
	router.get('/livebusdata', function (req, res) {
    //res.render('../build/index');
    knex('live_bus').then(data => res.json(data));
	});

	router.post('/livebusdata', (req, res) => {
		var liveBus = req.body.livebus;
			knex('live_bus').insert({
				LiveBus: liveBus
			})
	});
		return router;
}
module.exports = createRoutes;
