//Earthquakes with magnitude 2.5+ in the past 7 days
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'

// defining this function so we don't repeat ourselves
// adds a waterfall if/else statement to determine bubble marker color.
function getColor(d) {
  return  d > 90 ? 'red' :
          d > 70 ? 'darkorange' :
          d > 50 ? 'orange' :
          d > 30 ? 'yellow' :
          d > 10 ? 'lime' : 
          'green'
}

d3.json(url).then(function(data) {

  //console.log(data);
  features = data.features;

  //console.log(data.features[0].geometry.coordinates);

  // Create a GeoJSON layer that contains the features array on the eqData object.
  let eqData = L.geoJSON(features, {
    
    //Styling for each bubble that gets plotted on the map
    style: function (feature) {
      let mag = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
          
      
      return {
       color: "black",
       weight: 1,
       fillOpacity: .6,
       // Decided on an exponential function for scaling since that's what earthquake magnitudes correspond to
       radius: mag ** 2,
       fillColor : getColor(depth)
      };
    },
    pointToLayer: function(geoJsonPoint, latlng) {
      return L.circleMarker(latlng);
    },
    //adding attribution for earthquake data for transparency reasons
    attribution: 'Earthquake Data: <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php">USGS GeoJSON Summary</a> | M2.5+ Past 7 Days'
  }).bindPopup(function (layer) {
    let place = layer.feature.properties.place;
    let mag = layer.feature.properties.mag;
    let depth = layer.feature.geometry.coordinates[2];
    let time = new Date(layer.feature.properties.time).toLocaleString();
    //Popup message on click, included for informational purposes
    return `<h4>${place}<br>Magnitude: ${mag}<br>Depth: ${depth.toFixed(2)}km<br>${time}</h4>`;
  });

  // tectonic plate boundary data
  let plateData = L.geoJSON(tectonicPlateData, {
    style: function (feature) {
      return {
        color: '#e46939', // line color
        weight: 2, // line thickness
      };
    },
    //adding attribution for tectonic plate data since it has an attribution license
    attribution: 'Tectonic Plate Data: <a href="https://github.com/fraxen/tectonicplates">Hugo Ahlenius on GitHub</a> - Data Sources: Hugo Ahlenius; Nordpil; Peter Bird - (<a href="https://opendatacommons.org/licenses/by/1-0/">ODC-By</a>) v1.0'
  });
  
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
    center: [ 20, -30 ],
    zoom: 3,
    layers: [street, plateData, eqData]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend that displays the colors used for depth indication
  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

    //create a div using the DomUtil and pass in the appropriate classes. One of these classes is used in custom.css for formatting
    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Earthquake Depth</strong>'],
    //numerical categories were selected to go past break point in the getColor() logic
    categories = [91, 71, 51, 31, 11, 10];

    //for loop to go through all categories and assign labels dynamically (">y" for first category, "x-y"range between breakpoints in middle, "<x" for last category)
    for (var i = 0; i < categories.length; i++) {
            div.innerHTML += labels.push( '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' 
            + (i === 0 ? ">" + (categories[i] - 1) : 
            i < categories.length - 1 ? (categories[i]-1) + "-" + (categories[i-1]-1) : 
            "<" + (categories[i])));
        }
        div.innerHTML = labels.join('<br>');
    return div;
    };

    //add the legend to the map
    legend.addTo(myMap);
});