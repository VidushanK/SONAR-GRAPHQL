
"use strict";
require('dotenv').config();

// Dependencies
const express       = require('express');
const bodyParser    = require("body-parser");
const request       = require('request-promise');
const cors          = require('cors');
const app           = express();
const PORT          = process.env.PORT || 3000;
const ENV           = process.env.NODE_ENV || 'development';
const knexConfig    = require("./knexfile.js");
const knex          = require("knex")(knexConfig[ENV]);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('build'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// requires live bus query file
const liveBusData = require('../util/translink')(knex);

// loops through sql rows query and returns necessary data
const getStopNumbers = ({ rows }) => rows.map(r => {
  return {
    stop: r.stop_number,
    lat: r.lat,
    lng: r.long
  }
});

const getBusCords = ({ rows }) => rows.map(r => {
  return {
    lat: r.lat,
    lng: r.long,
    routeNo: r.routeNo,
    direction: r.direction
  }
});
// Retrives stopNo from API and stores in /liveBusAPI
const getLiveBusCoord = stopNo => {
  var liveBusApi = `http://api.translink.ca/rttiapi/v1/buses?apikey=GMPEN4nbnZxrUBYQYkVh`
  return request({
    url: liveBusApi,
    method: "GET",
    timeout: 3000,
    headers: {
      Accept: 'application/JSON'
    }
  })
}

app.get('/livebusroutes', (req, res) => {
  const { stopId } = req.query;
  var apiGet = `http://api.translink.ca/rttiapi/v1/buses?apikey=GMPEN4nbnZxrUBYQYkVh&stopNo=${stopId}`;
  request({
    url: apiGet,
    method: "GET",
    timeout: 3000,
    headers: {
      Accept: 'application/JSON'
    }
  }).then((data) => {
    res.json(data)
  })
})

app.get('/busStopRoutes', (req, res) => {
  const { stopId } = req.query;
  var apiGet = `http://api.translink.ca/rttiapi/v1/stops/${stopId}/estimates?apikey=iLKjRZhiqjH0r0claiVf&count=3&timeframe=60`;
  request({
    url: apiGet,
    method: "GET",
    timeout: 3000,
    headers: {
      Accept: 'application/JSON'
    }
  }).then((data) => {
    res.json(data)
  })
})

// Stores bus coordination in localhost:3000/buses_coord
app.get('/buses_coord', (req, res) =>{
  const { lat, lng } = req.query;
  const sqlQuery = `SELECT *
    FROM bus
    WHERE ST_DWithin( Geography(ST_MakePoint(CAST(lat as float),
          CAST(long as float))),
          Geography(ST_MakePoint(${lat}, ${lng})),
          150);`

  knex.raw(sqlQuery)
    .then(getBusCords)
    .then(function (stops) {
      res.json(stops)
    })
})

// Stores bus stop locations and outputs the longitude and latitude of each bus within a radius
// Using POSTGIS
app.get('/get_stops_in_proximity', (req, res) => {
  const { lat, lng } = req.query;
  const sqlQuery = `SELECT *
    FROM bus_stops
    WHERE ST_DWithin( Geography(ST_MakePoint(CAST(lat as float),
          CAST(long as float))),
          Geography(ST_MakePoint(${lat}, ${lng})),
          150);`

  knex.raw(sqlQuery)
    .then(getStopNumbers)
    .then(function (stops) {
      res.json(stops)
    })
})
// Server is running in port 3000, and liveBusData is constantly being updated every 5 seconds
app.listen(3000, () => {
  setInterval(liveBusData, 5000);
  console.log(`Server listening on port ${PORT} in ${ENV} mode.`);
});
