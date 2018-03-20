import React, { Component } from 'react';
import canUseDOM from "can-use-dom";


import _ from 'lodash';
import Map from "./components/map.jsx";
import Sidebar from "./components/sidebar.jsx";
import stops from '../../server/db/json/stops.js';

import '../scss/application.scss';


function createMarker(lat, lng, stopId, busName = "", defaultAnimation = 2) {
  return {
    position: {
      lat: lat,
      lng: lng,
    },
    stopId: stopId,
    draggable: false,
    key: Math.random(),
    defaultAnimation: defaultAnimation,
    showInfo: true,
    info: [],
    busName: busName
  }
}
function createCircle(lat, lng) {
  return {
    position: {
      lat: lat,
      lng: lng,
    },
    key: Math.random(),
    opacity: 1,
    radius: 0
  }
}
const geolocation = (
  canUseDOM && navigator.geolocation ?
  navigator.geolocation :
  ({
    getCurrentPosition(success, failure) {
      failure(`Your browser doesn't support geolocation.`);
    },
  })
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: null,
      lng: null,
      circles: [],
      markers: [],
    }
    this.currentPosition = 0
    this.stopClickHandler = this.stopClickHandler.bind(this)
    this.counter = null
  }

  handleMarkerDrop(e) {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    console.log(lat, lng)
    fetch(`http://localhost:3000/buses_coord?lat=${lat}&lng=${lng}`)
      .then(response => response.json())
      .then((data) => {
        let location = this.state.markers.slice(0, 1);
        let busses = data.map(bus => {
          const busName = `${bus.routeNo} ${bus.direction}`

          // null for stopId to filter out stops and keep busses
          return createMarker(parseFloat(bus.lat), parseFloat(bus.lng), null, busName);
        })
        fetch(`http://localhost:3000/get_stops_in_proximity?lat=${lat}&lng=${lng}`)
          .then(response => response.json())
          .then((data) => {
            let location = this.state.markers.slice(0, 1);
            let stops = data.map(stop => {
              return createMarker(parseFloat(stop.lat), parseFloat(stop.lng), parseInt(stop.stop));
            })

            let newMarkers = [
              location,
              ...stops,
              ...busses
            ]

            const newCircles = this.state.circles.concat(createCircle(lat, lng))

            this.setState({
              circles: newCircles,
              markers: newMarkers,
              lat: lat,
              lng: lng,
            }, this.startAnimation.bind(this))
          })
      })
  }

  handleAutoUpdate() {
    if (this.counter) clearTimeout(this.counter)
    this.counter = setInterval(() => {
      fetch(`http://localhost:3000/buses_coord?lat=${this.state.lat}&lng=${this.state.lng}`)
        .then(response => response.json())
        .then((data) => {
          let busses = data.map(bus => {
            const busName = `${bus.routeNo} ${bus.direction}`

            // null for stopId so to only get busses, 0 for animation so to not animate on update
            return createMarker(parseFloat(bus.lat), parseFloat(bus.lng), null, busName, 0);
          })
          let updatedMarkers = this.state.markers.filter(marker => marker.stopId !== null)
          this.setState({
            markers: [
              ...busses,
              ...updatedMarkers
            ]
          })
        })
    }, 5000)
  }


  startAnimation() {
    //invokes auto refresh of bus locations
    this.handleAutoUpdate()

    if (this.animating) return;
    this.animating = true;
    this.tick();
  }

  tick() {
    let newCircles = this.state.circles
    let secondCircle = this.state.circles
    newCircles.forEach(circle => {
      circle.radius += 200 / 30
      circle.opacity -= 1 / 40
    })

    newCircles = newCircles.filter(circle => circle.opacity > 0)
    secondCircle = secondCircle.filter(circle => circle.opacity > 0)

    this.setState({
      circles: newCircles, secondCircle
    }, () => {
      this.animating = newCircles.length > 0
      if (this.animating) {
        requestAnimationFrame(this.tick.bind(this))
      }
    })
  }

  // Handles clicks on bus stops
  stopClickHandler(clickedMarker) {
    const newMarkers = [...this.state.markers];
    newMarkers.forEach(marker => marker.showInfo = false)
    const index = this.state.markers.findIndex(marker => marker.stopId === clickedMarker.stopId)
    fetch(`http://localhost:3000/busStopRoutes?stopId=${clickedMarker.stopId}`)
      .then(response => response.json())
      .then(data => JSON.parse(data))
      .then((data) => {
        //takes the index of the clicked marker
        newMarkers[index].showInfo = true;
        newMarkers[index].info = data;
        //passes in the new marker object
        this.setState({
          markers: newMarkers
        })
      })
  };

  componentDidMount() {
    geolocation.getCurrentPosition((position) => {
      if (this.isUnmounted) {
        return;
      }
      this.setState({
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        content: `Location found using HTML5.`,
      });
    }, (reason) => {
      if (this.isUnmounted) {
        return;
      }
      this.setState({
        center: {
          lat: 60,
          lng: 105,
        },
        content: `Error: The Geolocation service failed (${reason}).`,
      });
    });
  }


  render() {
    return (
      <div id="map-wrapper">
        <Map
          containerElement={
            <div style={{ height: "100%" }} />
          }
          mapElement={
            <div style={{ height: "100%" }} />
          }
          onMapClick={(event) => this.handleMarkerDrop(event)}
          circles={this.state.circles}
          markers={this.state.markers}
          onMarkerClick={this.stopClickHandler}
          center={this.state.center}

        />

        <Sidebar
          markers={this.state.markers}
        />
      </div>
    )
  }
}

export default App;
