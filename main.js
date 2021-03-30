// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 150, bottom: 40, left: 300 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 500;
let graph_2_width = (MAX_WIDTH / 2) + 450, graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 500;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left + 35}, ${margin.top})`);

let countRef = svg.append("g");

function cleanData(data, comparator, numExamples) {
    return data.sort(comparator).slice(0, numExamples);
}
let my_data
d3.csv("../data/netflix.csv").then(function (data) {
    my_data = cleanData(data, function (a, b) { return parseInt(b.count) - parseInt(a.count) }, NUM_UNIQUE_ENTRIES);
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

    let x = d3.scaleLinear()
        .domain([0, d3.max(results, function (d) { return parseInt(d.count); })])
        .range([0, graph_1_width - margin.left - margin.right]);

    let y = d3.scaleBand()
        .domain(results.map(function (d) { return d["listed_in"] }))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.1);


    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));


    let color = d3.scaleOrdinal()
        .domain(data.map(function (d) { return d["listed_in"] }))
        .range(d3.quantize(d3.interpolateHcl("#ff0000", "#ffa500"), NUM_GENRES));

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

    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function (d) { return x(parseInt(d.count)) + 10; })
        .attr("y", function (d) { return y(d.listed_in) + 7.5 })
        .style("text-anchor", "start")
        .text(function (d) { return parseInt(d.count) })
        .style("font", "10px TimesNewRoman")
        .style("font-weight", 900);

    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Number of Titles per Genre")
        .style("font", "20px TimesNewRoman")
        .style("font-weight", 900);

    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2},
                                    ${(graph_1_height - margin.top - margin.bottom) + 15})`)
        .style("text-anchor", "middle")
        .text("Number of Titles")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

    svg.append("text")
        .attr("transform", `translate(-150, ${(graph_1_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .text("Genres on Netflix")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

})

let svg_2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let countRef_2 = svg_2.append("g");

let my_data_2
d3.csv("../data/netflix.csv").then(function (data) {
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
        dur_average.push(+(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(3))
    });


    var results_2 = [];
    for (j = 0; j < Object.values(movies_grouped).length; j++) {
        dict_2 = {};
        dict_2["release_year"] = Object.keys(movies_grouped)[j];
        dict_2["duration_average"] = Object.values(dur_average)[j];
        results_2.push(dict_2)
    }


    let x = d3.scaleLinear()
        .domain([d3.min(results_2, function (d) { return d.release_year; }), d3.max(results_2, function (d) { return d.release_year; })])
        .range([0, graph_2_width - margin.left - margin.right]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(results_2, function (d) { return d.duration_average; })])
        .range([graph_2_height - margin.top - margin.bottom, 0]);

    svg_2.append("g")
        .attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom} )`)
        .call(d3.axisBottom(x));

    svg_2.append("g")
        .call(d3.axisLeft(y));

    svg_2.append("path")
        .data([results_2])
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function (d) { return x(d.release_year) })
            .y(function (d) { return y(d.duration_average) }));

    svg_2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`)
        .style("text-anchor", "middle")
        .text("Average Runtime of Movies According to Release Year")
        .style("font", "20px TimesNewRoman")
        .style("font-weight", 900);

    svg_2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                    ${(graph_2_height - margin.top - margin.bottom) + 35})`)
        .style("text-anchor", "middle")
        .text("Release Year")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

    svg_2.append("text")
        .attr("transform", `translate(-90, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .text("Average Runtime")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

    var bisect = d3.bisector(function (d) { return d["release_year"]; }).left;

    var circle = svg_2
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    var circleText = svg_2
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
        .style("font-weight", 900);

    svg_2
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', graph_2_width)
        .attr('height', graph_2_height)
        .on('hover_mouse', hover_mouse)
        .on('move_mouse', move_mouse)
        .on('mouse_function', mouse_function);


    function hover_mouse() {
        circle.style("opacity", 1)
        circleText.style("opacity", 1)
    }

    function move_mouse() {
        var new_x = x.invert(d3.mouse(this)[0]);
        var j = bisect(results_2, new_x, 1);
        wanted = results_2[j]
        circle
            .attr("cx", x(wanted["release_year"]))
            .attr("cy", y(wanted["duration_average"]))
        circleText
            .html("x:" + wanted["release_year"] + "  -  " + "y:" + wanted["duration_average"])
            .attr("x", x(wanted["release_year"]) + 15)
            .attr("y", y(wanted["duration_average"]))
    }

    function mouse_function() {
        circle.style("opacity", 0)
        circleText.style("opacity", 0)
    }

})

let svg_3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

let countRef_3 = svg_3.append("g");

let my_data_3
d3.csv("../data/netflix.csv").then(function (data) {
    my_data_3 = cleanData(data, function (a, b) { return parseInt(b.count) - parseInt(a.count) }, NUM_UNIQUE_ENTRIES);


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
    var splitted_actors = [];
    var splitted_directors = [];
    for (i = 0; i < only_movies.length; i++) {
        splitted_actors.push(only_movies[i]["cast"].split(','));
        splitted_directors.push(only_movies[i]["director"].split(','));
    }

    var pairs_across_all_is = []
    for (i = 0; i < splitted_directors.length; i++) {
        var direc_at_i = splitted_directors[i]
        var act_at_i = splitted_actors[i]
        for (j = 0; j < direc_at_i.length; j++) {
            for (z = 0; z < act_at_i.length; z++) {
                if (!direc_at_i[j] == "") {
                    if (!act_at_i[z] == "") {
                        combinations = [];
                        combinations.push(direc_at_i[j], act_at_i[z]);
                        if (combinations in pairs_across_all_is) {
                            pairs_across_all_is[combinations]++;
                        }
                        else {
                            pairs_across_all_is[combinations] = 1;
                        }
                    }
                }
            }
        }
    }

    var sorted_pairs = Object.keys(pairs_across_all_is).map(function (key) { return [key, pairs_across_all_is[key]] }).sort(function (i, i2) { return i2[1] - i[1]; });

    var results_3 = [];
    for (j = 0; j < 35; j++) {
        tops = {};
        tops["combo"] = sorted_pairs[j][0];
        tops["count"] = sorted_pairs[j][1];
        results_3.push(tops)
    }

    let x = d3.scaleLinear()
        .domain([0, d3.max(results_3, function (d) { return parseInt(d.count); })])
        .range([0, graph_3_width - margin.left - margin.right]);

    let y = d3.scaleBand()
        .domain(results_3.map(function (d) { return d["combo"] }))
        .range([0, graph_3_height - margin.top - margin.bottom])
        .padding(0.1);

    svg_3.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    let color = d3.scaleOrdinal()
        .domain(data.map(function (d) { return d["combo"] }))
        .range(d3.quantize(d3.interpolateHcl("#33CEFF", "#33FFAF"), COMBO_NUMS));

    let bars = svg_3.selectAll("rect").data(results_3);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function (d) { return color(d["combo"]) })
        .attr("x", x(0))
        .attr("y", function (d) { return y(d["combo"]); })
        .attr("width", function (d) { return x(parseInt(d.count)); })
        .attr("height", y.bandwidth());

    let counts = countRef_3.selectAll("text").data(results_3);

    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function (d) { return x(parseInt(d.count) + 0.2); })
        .attr("y", function (d) { return y(d.combo) + 8.5 })
        .style("text-anchor", "start")
        .text(function (d) { return parseInt(d.count) })
        .style("font", "10px TimesNewRoman")
        .style("font-weight", 900);

    svg_3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-20})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Top 35 Director-Actor Pairs")
        .style("font", "20px TimesNewRoman")
        .style("font-weight", 900);


    svg_3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2},
                                    ${(graph_3_height - margin.top - margin.bottom) + 15})`)
        .style("text-anchor", "middle")
        .text("Number of Pairs")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

    svg_3.append("text")
        .attr("transform", `translate(-243, ${(graph_3_height - margin.top - margin.bottom) / 2})`)
        .style("text-anchor", "middle")
        .text("Director/Actor Pairs")
        .style("font", "13px TimesNewRoman")
        .style("font-weight", 900);

})

function changeColorOne(color) {
    d3.select("#graph1")
        .selectAll("rect")
        .transition()
        .duration(2000)
        .style("fill", color)
}

function changeColorThree(color) {
    d3.select("#graph3")
        .selectAll("rect")
        .transition()
        .duration(2000)
        .style("fill", color)
}

