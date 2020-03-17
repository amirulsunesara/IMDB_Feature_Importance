function draw_correlation_bar_graph(response) {
  var keys = [];
  var values = [];
  var key_value = {};
  var max_value = 0;
  for (d in response) {
    keys.push(response[d].name);
    values.push(response[d].value);
    key_value[response[d].name] = response[d].value;
  }
  for (i of values) {
    if (max_value < i) {
      max_value = i;
    }
  }
  var color_list = [
    "#525c72",
    "#21ce03",
    "#fe3302",
    "#fa46ff",
    "#876d0d",
    "#a24568",
    "#159bfc",
    "#14926d",
    "#9149f8",
    "#fd5a93",
    "#85706a",
    "#ad4d1e",
    "#4a8b00",
    "#a96bb1",
    "#04859b",
    "#4d6643",
    "#e2770f",
    "#4567c6",
    "#d517a9",
    "#76527b",
    "#c310f3",
    "#d5324b",
    "#7c78a9",
    "#657b79",
    "#7d80fd",
    "#949401",
    "#b46965",
    "#017065",
    "#6f864d",
    "#805432",
    "#12ad4b",
    "#b86dfd",
    "#b0743b",
    "#c66495",
    "#eb6555",
    "#5c5c59",
    "#0e7b3a",
    "#7b5057",
    "#5785b7",
    "#a14297",
    "#986782",
    "#884eaf",
    "#ff3fc6",
    "#296b97",
    "#5e700c",
    "#e6147f",
    "#635b98",
    "#746b7b",
    "#6fa914",
    "#756c44",
    "#af830a",
    "#d85311",
    "#d25ac2",
    "#994d45",
    "#62768b",
    "#476263",
    "#7369ce",
    "#ff3d60",
    "#985b0b",
    "#2e7cfe",
    "#13938d",
    "#966ec9",
    "#d85d73",
    "#537f60",
    "#45934d",
    "#fe6001",
    "#166d7a",
    "#886996",
    "#c55345",
    "#cd5aeb",
    "#db07dc",
    "#9a674c",
    "#c1387f",
    "#719433",
    "#cd6c42",
    "#666f60",
    "#586d9d",
    "#067bca",
    "#bb6005",
    "#675665",
    "#aa4cbe",
    "#2b6f4d",
    "#5e66fb",
    "#a341e1",
    "#927941",
    "#1295ca",
    "#996efb",
    "#675942",
    "#b24250",
    "#dd3a2a",
    "#894b70",
    "#7c8011",
    "#407d7e",
    "#946064",
    "#df4aa2",
    "#7182cd",
    "#635879",
    "#60642a",
    "#4e763b",
    "#21b10b",
    "#a85587",
    "#b65c74",
    "#7a5d20",
    "#606971"
  ];

  var width = 530;
  var height = 480;
  var margin = 10;
  var position = 10;
  var data_average_ratings = {};
  var correlation_svg = d3
    .select("#correlation_bar_graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "genre_svg");

  var color_en = 3;
  bar_margin = 30;

  var bar_chart = correlation_svg
    .append("g")
    .attr("transform", `translate(${bar_margin+30}, ${bar_margin})`);
  var yScale = d3
    .scaleLinear()
    .range([height - 50, 0])
    .domain([0, max_value]);
  bar_chart.append("g").call(d3.axisLeft(yScale));
  var xScale = d3
    .scaleBand()
    .range([0, width - 150])
    .domain(keys)
    .padding(0.2);
  bar_chart
    .append("g")
    .attr("transform", `translate(0, ${height - 50})`)
    .call(d3.axisBottom(xScale));

  bar_chart
    .selectAll()
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", s => xScale(s))
    .attr("y", s => yScale(key_value[s]))
    .attr("height", s => height - 50 - yScale(key_value[s]))
    .attr("width", xScale.bandwidth())
    .attr("fill", function(d){ return "#5D80A3"})
    // .attr("fill", function(d) {
    //   if (color_en == color_list.length) {
    //     color_en = 0;
    //   }
    //   color_en = color_en + 1;
    //   return color_list[color_en];
    // })
    .attr("stroke", "#474747")
    .attr("stroke-width", 1)
    .on("mouseover", textMouseOver)
    .on("mouseout", textMouseOut)
    .on("click", go_to_attr_cluster);

  function textMouseOver(d) {
    d3.select(this).attr("stroke-width", 3);
  }

  function textMouseOut(d) {
    d3.select(this).attr("stroke-width", 1);
  }

    bar_chart.append("text")
    .attr("text-anchor", "end")
    .attr("x", -60)
    .attr("y", -20 )
    .text("Feature Importance")
    .attr("fill","#051D23")
    .attr("text-anchor", "start");

    bar_chart.append("text")
    .attr("text-anchor", "end")
    .attr("x", 440)
    .attr("y", 448)
    .text("Features")
    .attr("fill","#051D23");

  function go_to_attr_cluster(d) {
    console.log(d);
    //   correlation_svg.remove()
    //   draw_cluster("/prediction_result")
  }
}

function draw_cluster(url) {
  $.get(url, function(data) {
    var trace1 = {
      x: data.numVotes,
      y: data.ytest,
      mode: "markers",
      type: "scattergl",
      name: "numVotes",
      marker: {
        line: {
          width: 1,
          color: "#404040"
        }
      }
    };

    var trace2 = {
      x: data.numVotes,
      y: data.preds,
      mode: "markers",
      type: "scattergl",
      name: "predicted"
    };

    var data = [trace1, trace2];

    var layout = {
      height: 500,
      width: 550,

      xaxis: {
        showgrid: false,
        range: [-0.1, 1.2]
      },
      yaxis: {
        showgrid: false,
        range: [-0.1, 1.2]
      },
      title: "Actual Vs Prediction"
    };

    Plotly.newPlot("correlation_bar_graph", {
      data: data,
      layout: layout
    });
  });
}
