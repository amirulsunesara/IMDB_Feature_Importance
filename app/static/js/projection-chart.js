var margin = { top: 40, right: 140, bottom: 20, left: 200 },
  width = 1400 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

//columns for parallel axes
var columns = [
  {
    name: "startYear",
    displayName:"Start Year",
    scale: d3.scalePoint([0, height]),
    type: String
  },

  {
    name: "runtimeMinutes",
    displayName:"Run time (Minutes)",
    scale: d3.scaleLinear().range([0, height]),
    type: Number
  },
  {
    name: "numVotes",
    displayName:"Number of Votes",
    scale: d3.scaleLinear().range([height, 0]),
    type: Number
  },
  {
    name: "averageRating",
    displayName: "Average Rating",
    scale: d3.scaleLinear().range([0, height]),
    type: Number
  }
];

var x = d3.scalePoint()
  .domain(columns.map(function (d) { return d.name; }))
  .range([0, width]);

var line = d3.line()
  .defined(function (d) { return !isNaN(d[1]); });

var yAxis = d3.axisLeft()

var makeProj = function (data) {
  //color scale for connecting lines
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain([0, 10]);

  initialGenre = d3.map(data, function (d) { return d.genres; }).keys().sort()[0]
  var filtered = data.filter(function (d) {
    return d["genres"] === initialGenre
  })
  // populating initial data
  updateData(filtered)
  // function to create chart and to update it everytime the dropdown is changed
  function updateData(data) {
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")				
    .style("opacity", 0);
    d3.select("#projection-chart").selectAll('svg').remove();
    //creating svg to store chart
    var svg = d3.select("#projection-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dimension = svg.selectAll(".dimension")
      .data(columns)
      .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function (d) { return "translate(" + x(d.name) + ")"; });

    columns.forEach(function (dimension) {
      dimension.scale.domain(dimension.type === Number
        ? d3.extent(data, function (d) { return +d[dimension.name]; })
        : data.map(function (d) { return d[dimension.name]; }).sort());
    });


    svg.append("g")
      .attr("class", "background")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", connectAxis);

    svg.append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("stroke", function (d) { return myColor(d.averageRating) })
      .attr("d", connectAxis)

    //creating all axes
    dimension.append("g")
      .attr("class", "axis")
      .each(function (d) { d3.select(this).call(yAxis.scale(d.scale)); })
      .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .attr("fill", "black")
      .text(function (d) { return d.displayName; });

    //Creating labels (year) for first axis
    svg.select(".axis").selectAll("text:not(.title)")
      .attr("class", "label")
      .data(data, function (d) { return d.startYear || d; });

    // selecting elements to add interations
    var projection = svg.selectAll(".axis text,.background path,.foreground path")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);


    function mouseover(d) {
      svg.classed("active", true);
      //on hover of year label
      if (this.tagName == "text") {
        projection.classed("inactive", function (p) { return p.startYear !== d.startYear })
        projection.classed("active", function (p) { return p.startYear === d.startYear })
        projection.filter(function (p) { p === d }).each(this.parentNode.appendChild(this));
      }
      //on hover of a line
      else {

        projection.classed("inactive", function (p) { return p !== d })
        projection.classed("active", function (p) { return p === d })
        projection.filter(function (p) { p === d }).each(this.parentNode.appendChild(this));
        tooltip.transition()		
      .duration(200)		
      .style("opacity", .9);
        tooltip.html("Title: "+d.primaryTitle+"</br>"+"Year: "+d.startYear+"</br>Run time: "+d.runtimeMinutes+"</br>Number of votes: "+d.numVotes+"</br>Average Rating: "+d.averageRating).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
      }
    }

    function mouseout(d) {
      svg.classed("active", false);
      projection.classed("inactive", false);
      tooltip.transition()		
      .duration(200)		
      .style("opacity", 0);
    }

  }

// fetching the data for the selected genre
  var dropdownChange = function () {
    var genre = d3.select(this).property('value')
    var filtered = data.filter(function (d) {
      return d["genres"] === genre
    })

    updateData(filtered);
  };
// triggering onchange funtion 
  var dropdown = d3.select("#menu-projection-chart")
    .insert("select", "svg")
    .attr("class","btn btn-secondary dropdown-toggle")
    .on("change", dropdownChange);
//populating drop down list with genres
  dropdown.selectAll("option")
    .data(d3.map(data, function (d) { return d.genres; }).keys().sort())
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
    

}
//drawing the lines connecting axes
function connectAxis(d) {
  return line(columns.map(function (dimension) {
    return [x(dimension.name), dimension.scale(d[dimension.name])];
  }));
}
// fetching data from backend to plot graph using ajax
$(function () {
  $.ajax({
    url: '/proj_data',
    type: 'GET',
    dataType: "text",
    success: function (response) {

      data = d3.csvParse(response)
      makeProj(data)

    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      alert("Status: " + textStatus); alert("Error: " + errorThrown);
    }
  });
});