// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 150, bottom: 40, left: 300 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 500;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left + 35}, ${margin.top})`);

let countRef = svg.append("g");

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    return data.sort(comparator).slice(0, numExamples);
}

// load the data 
let my_data
d3.csv("../data/netflix.csv").then(function (data) {
    // clean and strip the data 
    my_data = cleanData(data, function (a, b) { return parseInt(b.count) - parseInt(a.count) }, NUM_UNIQUE_ENTRIES);

    // get all the unique genres, which we will use in our graphs's x-axis
    var all_genres = {};
    for (i = 0; i < my_data.length; i++) {
        var splitted_genres = my_data[i]["listed_in"].replace(/[" ]/g, '').split(',');
        for (genre = 0; genre < splitted_genres.length; genre++) {
            if (splitted_genres[genre] in all_genres) {
                all_genres[splitted_genres[genre]]++;
            }
            else {
                all_genres[splitted_genres[genre]] = 1;
            }
        }
    }

    let results = [];
    for (j = 0; j < Object.values(all_genres).length; j++) {
        dict = {};
        dict["listed_in"] = Object.keys(all_genres)[j];
        dict["count"] = Object.values(all_genres)[j];
        results.push(dict)
    }

    // create a linear scale for the x axis (num titles)
    let x = d3.scaleLinear()
        .domain([0, d3.max(results, function (d) { return parseInt(d.count); })])
        .range([0, graph_1_width - margin.left - margin.right]);

    // create a scale band for the y axis (genres)
    let y = d3.scaleBand()
        .domain(results.map(function (d) { return d["listed_in"] }))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.1);

    // adds y-axis label
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    //Define color scale
    let color = d3.scaleOrdinal()
        .domain(data.map(function (d) { return d["listed_in"] }))
        .range(d3.quantize(d3.interpolateHcl("#ff0000", "#ffa500"), NUM_GENRES));

    /*
    This next line does the following:
        1. Select all desired elements in the DOM
        2. Count and parse the data values
        3. Create new, data-bound elements for each data value
    */
    let bars = svg.selectAll("rect").data(results);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function (d) { return color(d["listed_in"]) })
        .attr("x", x(0))
        .attr("y", function (d) { return y(d["listed_in"]); })
        .attr("width", function (d) { return x(parseInt(d.count)); })
        .attr("height", y.bandwidth());

    let counts = countRef.selectAll("text").data(results);

    // Renders the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function (d) { return x(parseInt(d.count)) + 10; })
        .attr("y", function (d) { return y(d.listed_in) + 7.5 })
        .style("text-anchor", "start")
        .text(function (d) { return parseInt(d.count) })
        .style("font", "10px TimesNewRoman")
        .style("font-weight", 900);

    // chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Number of Titles per Genre on Netflix")
        .style("font", "20px TimesNewRoman")
        .style("font-weight", 900);


    // x-axis label
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2},
                                    ${(graph_1_height - margin.top - margin.bottom) + 15})`)
        .style("text-anchor", "middle")
        .text("Number of Titles")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

    // y-axis label
    svg.append("text")
        .attr("transform", `translate(-150, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .text("Genres on Netflix")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);
})

let svg_2 = d3.select("#graph2")
    .append("svg_2")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left + 35}, ${margin.top})`);

let countRef_2 = svg_2.append("g");

let my_data_2
d3.csv("../data/netflix.csv").then(function (data) {
    // clean and strip the data 
    my_data_2 = cleanData(data, function (a, b) { return parseInt(b.count) - parseInt(a.count) }, NUM_UNIQUE_ENTRIES);

    only_movies = [];
    counter = 0;
    for (el = 0; el < my_data_2.length; el++) {
        if (my_data_2[el]["type"] == "Movie") {
            only_movies[counter] = my_data_2[el]
            counter++;
        }
        else {
            continue;
        }
    }

    var movies_grouped = {};
    for (mov = 0; mov < only_movies.length; mov++) {
        if (only_movies[mov]["release_year"] in movies_grouped) {
            movies_grouped[only_movies[mov]["release_year"]].push(only_movies[mov]["duration"])
        }
        else {
            movies_grouped[only_movies[mov]["release_year"]] = []
            movies_grouped[only_movies[mov]["release_year"]].push(only_movies[mov]["duration"])
        }
    }

    let dur_average = [];
    Object.keys(movies_grouped).forEach(function (key) {
        var durations = movies_grouped[key].toString().match(/(\d|, )+/g).map(function (item) {
            return parseInt(item, 10);
        })
        dur_average.push(durations.reduce((a, b) => a + b, 0) / durations.length)
    });


   let results_2 = [];
    for (j = 0; j < Object.values(movies_grouped).length; j++) {
        dict_2 = {};
        dict_2["year"] = Object.keys(movies_grouped)[j];
        dict_2["dur_average"] = Object.values(dur_average)[j];
        results_2.push(dict_2)
    }

    console.log(results_2);

// create a scale for the x axis
    let x = d3.scaleLinear()
        .domain([d3.min(results_2, function(d) { return d.year }), d3.max(results_2, function(d) { return d.yar; })])
        .range([0, graph_2_width - margin.left - margin.right]);

    // create a scale for the y axis (avg duration)
    let y =  d3.scaleLinear()
        .domain([0, d3.max(results_2, function(d) { return d.dur_average; })])
        .range([graph_2_height - margin.top - margin.bottom, 0]);

    // adds x-axis label
    svg_2.append("g")
        .attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom} )`)
        .call(d3.axisBottom(x));
    
    // adds y-axis label
    svg_2.append("g")
        .call(d3.axisLeft(y));

    svg_2.append("path")
        .data([results_2])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
        .x(function(d) {return x(d.year)})
        .y(function(d) {return y(d.dur_average)}));

    // chart title
    svg_2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-10})`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Average Runtime of Movies by Release Year");

    // x-axis label
    svg_2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                    ${(graph_2_height - margin.top - margin.bottom) + 30})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Release Year");

    // y-axis label
    svg_2.append("text")
        .attr("transform", `translate(-175, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Average Runtime");
})

