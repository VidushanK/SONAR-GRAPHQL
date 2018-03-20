import React from 'react'

class Sidebar extends React.Component {
  render() {
    // Get info arrays and filter those that are truthy
    let info = this.props.markers.filter(marker => marker.showInfo).map(marker => marker.info);
    // Compact the array of arrays into a single one and then turn it into a div
    info = info.reduce((acc, infoArray) => acc.concat(infoArray), []).map((info, index) => {
      let departure = info.Schedules[0].ExpectedCountdown
      return <div id="stop-info">
        <ul className="sidebar-nav">
          <h2 className="route">
            {info.RouteNo}
          </h2>
          <li className="direction">
            Direction: {info.Direction}
          </li>
          <li className="destiantion">
            Towards: {info.Schedules[0].Destination}
          </li>
          <li className="departure">
            Leaving in: {departure}  minute(s)
         </li>
        </ul>
      </div>
    });
    return (
      <div id="sidebar">
        {info}
      </div>
    );
  }
}

export default Sidebar;