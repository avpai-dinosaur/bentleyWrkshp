function renderMeteorites(data, meteoriteLayer) {
    data.forEach((d) => {
        lat = isNaN(d.reclat) ? 0 : d.reclat;
        long = isNaN(d.reclong) ? 0 : d.reclong;
        L.circle([lat, long], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: isNaN(d.mass) ? 0 : Math.log(d.mass)
        }).addTo(meteoriteLayer);
    });
}

// Initialize the map
const map = L.map("map", {
    preferCanvas: true
}).setView([0, 0], 1);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    updateWhenIdle: true,
    updateWhenZooming: false
}).addTo(map);

// Create a layer for the meteorites
const meteoriteLayer = L.layerGroup();
meteoriteLayer.addTo(map)

// Grab the data
fetch("https://data.nasa.gov/resource/gh4g-9sfh.json?$limit=50000")
    .then((response) => response.json())
    .then((data) => renderMeteorites(data, meteoriteLayer))
    .catch((err) => console.log(err));


