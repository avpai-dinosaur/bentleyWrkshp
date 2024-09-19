function getYear(meteorite) {
    const date = new Date(meteorite.year);
    return date.getFullYear();
}

function getMass(meteorite) {
    return Math.floor(Number(meteorite.mass));
}

function equalFreqBin(data, colors) {
    const sortedData = data.map(d => getMass(d)).sort((a, b) => a - b);
    const bins = [];
    for (let i = 0; i < colors.length - 1; ++i) {
        let cutoff = (i + 1) * Math.floor(sortedData.length / colors.length);
        bins.push([colors[i], sortedData[cutoff]]);
    }
    bins.push([colors[colors.length - 1], sortedData[sortedData.length - 1]]);
    return bins;
}

function renderMeteorites(data, meteoriteLayer, bins) {
    console.log(data);
    meteoriteLayer.clearLayers();
    data.forEach((d) => {
        let lat = isNaN(d.reclat) ? 0 : d.reclat;
        let long = isNaN(d.reclong) ? 0 : d.reclong;
        
        let color;
        for (let i = 0; i < bins.length; ++i) {
            color = bins[i][0];
            if (getMass(d) <= bins[i][1]) {
                break;
            }
        }

        const marker = L.circleMarker([lat, long], {
            fillColor: color,
            fillOpacity: 0.75,
            weight: 0,
            radius: 5
        });
        marker.bindPopup(`<b>Location:</b> ${d.name}<br><b>Mass:</b> ${d.mass} (g)<br><b>Year:</b> ${getYear(d)}`);
        marker.addTo(meteoriteLayer);
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
    .then((data) => {
        // Filter out invalid year and mass values
        const validData = data.filter((elem) => {
            const date = new Date(elem.year);
            return !isNaN(date.getTime()) && !isNaN(Number(elem.mass));
        });

        // get color ranges
        const colors = [
            "#ffcb05",
            "#d0a200",
            "#a27c00",
            "#785700",
            "#523300",
            "#380900"
        ]
        const bins = equalFreqBin(validData, colors);
        console.log("bins", bins);

        renderMeteorites(validData, meteoriteLayer, bins);
    })
    .catch((err) => console.log(err));