
function getYear(meteorite) {
    const date = new Date(meteorite.year);
    return date.getFullYear();
}

function filterMeteorites(yearStart, yearEnd, data) {
    function includeMeteorite(meteorite) {
        const year = getYear(meteorite);
        return (yearStart <= year) && (year <= yearEnd);
    }

    return data.filter(includeMeteorite);
}

function timeRangeSlider(meteoriteLayer, id, data) {
    // Read data into a crossfilter
    const chart = dc.barChart(id);
    const ndx = crossfilter(data);
    const yearDim = ndx.dimension((elem) => getYear(elem));
    const minYear = getYear(yearDim.bottom(1)[0]);
    const maxYear = getYear(yearDim.top(1)[0]);
    const countPerYear = yearDim.group().reduceCount();

    let meteorites;

    // Populate chart data
    chart
        .height(100)
        .dimension(yearDim)
        .group(countPerYear)
        .x(d3.scaleLinear().domain([minYear, maxYear]))
        .round(Math.round)
        .elasticY(true)
        .on('renderlet', () => {
            const filter = chart.filter();
            if (filter) {
                meteorites = filterMeteorites(filter[0], filter[1], data);
                d3.select(id).select(".yearStart").html(filter[0]);
                d3.select(id).select(".yearEnd").html(filter[1]);
            }
            else {
                meteorites = filterMeteorites(minYear, maxYear, data);
                d3.select(id).select(".yearStart").html(minYear);
                d3.select(id).select(".yearEnd").html(maxYear);
            }
            console.log(meteorites);
            renderMeteorites(meteorites, meteoriteLayer);
        });


    // Format x and y ticks
    chart.xAxis().tickFormat(function (d) { return d }); // convert back to base unit
    chart.yAxis().tickFormat(d3.format(".2~s"));
    chart.yAxis().ticks(4);

    dc.registerChart(chart, id);
    dc.renderAll();
}

function renderMeteorites(data, meteoriteLayer) {
    console.log("rendering");
    meteoriteLayer.clearLayers();
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
meteoriteLayer.addTo(map);

// Grab the data
fetch("https://data.nasa.gov/resource/gh4g-9sfh.json?$limit=50000")
    .then((response) => response.json())
    .then((data) => {
        // Filter out invalid year values
        const validData = data.filter((elem) => {
            const date = new Date(elem.year);
            if (isNaN(date.getTime())) {
                return false;
            }
            return true;
        });
        timeRangeSlider(meteoriteLayer, "#year_range", validData);
    })
    .catch((err) => console.log(err));

