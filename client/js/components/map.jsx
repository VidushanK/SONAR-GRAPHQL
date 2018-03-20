import React from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow, Circle } from "react-google-maps";




const Map = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={17}
    center={props.center}
    /* defaultCenter={{ lat: 49.28705656602098, lng:  -123.1417715549469}} */
    onClick={props.onMapClick}
    defaultOptions={{
      disableDefaultUI: true,
      zoomControl: true,
      styles: require(`./MapStyles.json`),
    }}
  >

    {props.circles.map((circle, index) => (
      <Circle
        key={circle.key}
        clickable={false}
        center={circle.position}
        radius={circle.radius}
        options={{
          fillColor: "grey",
          fillOpacity: 10,
          strokeColor: "black",
          strokeOpacity: circle.opacity,
          strokeWeight: 1,
        }}
      />
    ))}

    {props.markers.map((marker, index) => {
    let info = props.markers.map(marker => marker.info);
      //Logic to separate busses from bus stops so they render with different icons
      if (marker.stopId !== NaN && marker.stopId >= 1) {
        return <Marker
          {...marker}
          options={{
            icon: {
              url: "https://image.flaticon.com/icons/png/128/0/622.png",
              scaledSize: new google.maps.Size(40, 40)

            }
          }}
          onClick={() => props.onMarkerClick(marker)}
        >
        </Marker>
      } else if (marker.stopId === null) {
          return <Marker
            {...marker}
            showInfo="true"
            options={{
              icon: {
                url: "http://www.clker.com/cliparts/P/H/9/k/y/q/orange-bus-hi.png",
                scaledSize: new google.maps.Size(25, 25)
              }
            }}
          >
            {marker.showInfo && (
              <InfoWindow key="Math.random()">
                <div id="bus-info-window">{marker.busName}</div>
              </InfoWindow>
            )}
          </Marker>
      }
    })
    }
  </GoogleMap>
));

export default Map
