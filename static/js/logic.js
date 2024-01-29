//Earthquakes with magnitude 2.5+ in the past 7 days
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'

// defining this function so we don't repeat ourselves
function getColor(d) {
  return  d > 90 ? 'red' :
          d > 70 ? 'darkorange' :
          d > 50 ? 'orange' :
          d > 30 ? 'yellow' :
          d > 10 ? 'lime' : 'green'
}

d3.json(url).then(function(data) {

  //console.log(data);
  features = data.features;

  //console.log(data.features[0].geometry.coordinates);

  //defining a function to deal with each feature from the d3 
  // function eachFeature(feature, layer) {
  //   layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  // }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let eqData = L.geoJSON(features, {
    // onEachFeature: eachFeature,
    style: function (feature) {
      let mag = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
          
      
      return {
       color: "black",
       weight: 1,
       fillOpacity: .6,
       radius: mag ** 2,
       fillColor : getColor(depth)
      };
    },
    pointToLayer: function(geoJsonPoint, latlng) {
      return L.circleMarker(latlng);
    }
  }).bindPopup(function (layer) {  
    let place = layer.feature.properties.place;
    let mag = layer.feature.properties.mag;
    let depth = layer.feature.geometry.coordinates[2];
    let time = new Date(layer.feature.properties.time).toLocaleString();
    return `<h4>${place}<br>Magnitude: ${mag}<br>Depth: ${depth.toFixed(2)}km<br>${time}</h4>`;
  });

  // tec
  let plateData = L.geoJSON(tectonicPlateData, {
    style: function (feature) {
      return {
       color: '#e46939',
       weight: 2,
      };
    }
  });

  // for (let i = 0; i < features.length; i++) {
  //   let location = features[i].geometry;
  //   if (location) {
  //     //console.log(location);
  //     eqArray.push([location.coordinates[1], location.coordinates[0]]);
  //   }
  // }
  
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: eqData,
    "Tectonic Plates": plateData
  };
    
  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [ 54, -100 ],
    zoom: 3,
    layers: [street, plateData, eqData]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Earthquake Depth</strong>'],
    //categories were selected to go past breaking points in colors
    categories = [91, 71, 51, 31, 11, 9];

    for (var i = 0; i < categories.length; i++) {
            div.innerHTML += labels.push( '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' 
            + (i === 0 ? ">" + (categories[i] - 1) : 
            i < categories.length - 1 ? (categories[i]-1) + "-" + (categories[i-1]-1) : 
            "<" + (categories[i]+1)));
        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(myMap);
});