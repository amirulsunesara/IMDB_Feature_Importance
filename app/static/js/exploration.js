//reference https://www.d3-graph-gallery.com/graph/circularpacking_template.html
//http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
//https://blog.risingstack.com/d3-js-tutorial-bar-charts-with-javascript/


//Variable declared that shows the status 
var first_list_status = "bar";
var second_list_status = "bubble";
var exploration_height = 1250
var exploration_width = 1500
var current_year = 0;

//Create the parent SVG
var container = d3.select("#exploration_id").append("svg")
        .attr("width", exploration_width)
        .attr("height", exploration_height)
        .attr("id","exploration_svg");
var exploration_group = container.append("g");

//Sets Tooltip div
var div = d3.select("body").append("div").attr("class", "bubbles_tooltip").style("opacity", 0);
var div_2 = d3.select("body").append("div").attr("class", "tool").style("opacity", 0);

//The accepts onlick events from buttons
$("#bar_view_first").click(function(){
    $("#bar_view_first").addClass("active_class");
    $("#list_view_first").removeClass( "active_class");
    first_list_status = "bar"
    exploration_group.selectAll("*").remove()
    load_exploration_chart()
  });
  $("#list_view_first").click(function(){
    $("#list_view_first").addClass("active_class");
    $("#bar_view_first").removeClass( "active_class");
    first_list_status = "list"
    exploration_group.selectAll("*").remove()
    load_exploration_chart()
  });

  $("#bar_view_second").click(function(){
    $("#bar_view_second").addClass("active_class");
    $("#bubble_view_second").removeClass( "active_class");
    second_list_status = "bar"
    exploration_group.select("#second_bar").remove();
    draw_genre_count_bar_chart(current_year)
  });
  $("#bubble_view_second").click(function(){
    $("#bubble_view_second").addClass("active_class");
    $("#bar_view_second").removeClass( "active_class");
    second_list_status = "bubble"
    exploration_group.select("#second_bar").remove();
    draw_genre_count_bubble_year(current_year)
  });
  $(".bubble-bar").hide();

  //Loads the initial chart 
function load_exploration_chart(){
    $.get("/get_unique_year_count", function(data) {

          if(first_list_status == "bar"){
            draw_bar(data,container)
          }else if(first_list_status == "list"){
            draw_list(data,container)
          }
      });
}

//this function draws the entire list chart 
function draw_list(data,container){
    keys = Object.keys(data)
    var list_item_height = Math.floor(((exploration_height-90)/keys.length));
    var list_rect = exploration_group
    .selectAll("rect")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 0)
    // .attr("y", 100)
    .attr("y", function(d) { var index = keys.indexOf(d); return 20+(index * list_item_height + (index * 3));})
    .attr("height", list_item_height)
    .attr("width", 220)
    .attr("id", function(d) { return "bar_"+d;})
    .attr("fill","#F9F9F9")
    .attr("stroke", "#474747")
    .attr("stroke-width", 1)
    .on("click", list_click);

    var list_text = exploration_group
    .selectAll("text")
    .data(keys)
    .enter()
    .append("text")
    .text(function(d) {return "Year: "+d+" Movie Count: "+data[d];})
    .attr("x", 10)
    // .attr("y", 100)
    .attr("y", function(d) { var index = keys.indexOf(d); return 42 +(index * list_item_height + (index * 3));})
    .attr("fill","#262424")
    .style("font-size", 14)
    .style("fill", "black")
    .on("click", list_click);

    var myText =  exploration_group.append("text")
    .attr("y", 15)
    .attr("x", 10)
    .text("Year / Count List");

    function list_click(d){
        current_year = d
        exploration_group.select("#second_bar").remove();
        exploration_group.selectAll("rect").attr("fill","#F9F9F9");
        $(".bubble-bar").show()
        d3.select("#"+"bar_"+d).attr("fill","#A0A0A0");
        if(second_list_status == "bubble"){
          draw_genre_count_bubble_year(d)
        }else{
          draw_genre_count_bar_chart(d)
        }
        
      }

}

//this function draws the initial bar graph 
function draw_bar(data,container){
    var keys = Object.keys(data)
    var max_value = 0;
        for (d of keys) {
          if (max_value < data[d]) {
            max_value = data[d];
          }
        }
        bar_margin = 30
        var bar_height = 600;
        var bar_width = 900;
        var bar_chart = exploration_group.append("g").attr("transform", `translate(${bar_margin}, ${bar_margin})`);
        var yScale = d3.scaleLinear().range([bar_height, 0]).domain([0, max_value]);
        bar_chart.append("g").call(d3.axisLeft(yScale));
        var xScale = d3.scaleBand().range([0, bar_width]).domain(keys).padding(0.3);
        bar_chart
          .append("g")
          .attr("transform", `translate(0, ${bar_height})`)
          .call(d3.axisBottom(xScale));
        bar_chart
          .selectAll()
          .data(keys)
          .enter()
          .append("rect")
          .attr("x", s => xScale(s))
          .attr("y", s => yScale(data[s]))
          .attr("height", s => bar_height - yScale(data[s]))
          .attr("width", xScale.bandwidth())
          .attr("fill", "#5D80A3")
          .attr("stroke", "#474747")
          .attr("stroke-width", 1)
          .on("mouseover",textMouseOver)
          .on("mouseout", textMouseOut)
          .on("click", bar_click);

          function bar_click(d){
            current_year = d
            $("#list_view_first").addClass("active_class");
            $("#bar_view_first").removeClass( "active_class");
            first_list_status = "list"
            exploration_group.selectAll("*").remove()
            $.get("/get_unique_year_count", function(data) {

                if(first_list_status == "bar"){
                  draw_bar(data,container)
                }else if(first_list_status == "list"){
                  draw_list(data,container)
                }
                exploration_group.selectAll("rect").attr("fill","#F9F9F9");
                d3.select("#"+"bar_"+d).attr("fill","#A0A0A0");
                $(".bubble-bar").show()

                if(second_list_status == "bubble"){
                  draw_genre_count_bubble_year(d)
                }else{
                  draw_genre_count_bar_chart(d)
                }
            });
            
          }

          bar_chart.append("text")
          .attr("text-anchor", "end")
          .attr("x", 0)
          .attr("y", -10 )
          .text("Year Count")
          .attr("fill","#051D23")
          .attr("text-anchor", "start");

          bar_chart.append("text")
          .attr("text-anchor", "end")
          .attr("x", 300)
          .attr("y", -10 )
          .text("Year Count / Year Bar Chart")
          .attr("fill","#051D23")
          .attr("text-anchor", "start");

          bar_chart.append("text")
          .attr("text-anchor", "end")
          .attr("x", 270)
          .attr("y", 640 )
          .text("Year")
          .attr("fill","#051D23");

          function textMouseOver(d){
            d3.select(this)
            .attr("stroke-width", 3);
          }
      
          function textMouseOut(d){
            d3.select(this)
            .attr("stroke-width", 1);
          }

        
}

//This function draws the genre bubble count
function draw_genre_count_bubble_year(year){
  $.get("http://127.0.0.1:5000/get_year_count?year="+year, function(data) {
      var genre_count_height = 500;
      var keys = Object.keys(data)
      var genre_count_width = 900;
      var max_value = 0;
          for (d of keys) {
            if (max_value < data[d]["count"]) {
              max_value = data[d]["count"];
            }
          }
          bar_margin = 50
          var bubble_genre_chart = exploration_group.append("g").attr("id","second_bar").attr("transform", `translate(${300}, ${bar_margin})`).attr("fill", "#E9F4FF");

          var genre_nodes = [];
          var count = 0;
          for (d of Object.keys(data)) {
            genre_nodes.push({});
            count = count + 1;
          }
          var size_bottom = 40
          var size_top = 105

          var size = d3.scaleLinear().domain([0, max_value]).range([size_bottom, size_top]);

          
          var color_key = {0:"#f7fbff",1:"#deebf7",2:"#c6dbef",3:"#9ecae1",4:"#6baed6",5:"#4292c6",6:"#2171b5",7:"#08519c",8:"#08306b",9:"#062655"}
                  var color_index = 0;
                  var circles = bubble_genre_chart.selectAll("circle").data(keys).enter().append("circle").attr("r", function(d) { return size(data[d]["count"]);})
                    .attr("cx", genre_count_width / 2)
                    .attr("cy", genre_count_height / 2)
                    .attr("fill",function(d){var ratings_key = Math.floor(data[d]["avg_rating"]); return color_key[ratings_key]})
                    .attr("stroke", "#474747")
                    .attr("stroke-width", 1)
                    .attr("class", function(d) {var ratings_key = Math.floor(data[d]["avg_rating"]); return "big_circle_chart_"+ratings_key+" "+"big_circle";})
                    .call(d3.drag().on("drag", dragged))
                    .on("click", bubble_click)
                    .on("mouseover",mouse_over)
                    .on("mouseout", mouse_out);

                    var texts = bubble_genre_chart
                    .selectAll("texts")
                    .data(keys)
                    .enter()
                    .append("text")
                    .text(function(d) {
                      return d;
                    })
                    .attr("id", function(d) {
                      return d;
                    })
                    .attr("x", function(d) {
                      index_v = keys.indexOf(d);
                      return genre_nodes[index_v].x;
                    })
                    .attr("y", function(d) {
                      index_v = keys.indexOf(d);
                      return genre_nodes[index_v].y;
                    })
                    .style("font-size", 11)
                    .style("fill", "white")
                    .on("click", bubble_click)
                    .on("mouseover",textMouseOver)
                    .on("mouseout", textMouseOut);
              
                  function dragged(d) {
                    d3.select(this)
                      .attr("cx", d3.event.x)
                      .attr("cy", d3.event.y);
                    d3.select("#" + d)
                      .attr("x", d3.event.x - d.length * 3)
                      .attr("y", d3.event.y);
                  }

                  function bubble_click(d){
                    exploration_group.select("#third_bar").remove();
                    draw_bubble_chart(d,year)
                  }
                  function mouse_over(d){
                    data_keys = Object.keys(data);
      
                    d3.select(this).attr("stroke-width", 4);
                    div_2.transition().duration(200).style("opacity", .9);
                    div_2.html("Average Ratings: "+data[d]["avg_rating"]+"</br> Count: "+data[d]["count"]).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px"); 
                }
      
                function mouse_out(d){
                    d3.select(this).attr("stroke-width", 1);
                    div_2.transition().duration(500).style("opacity", 0);
                }
        
                  function textMouseOver(d){
                    d3.select(this)
                    .attr("stroke-width", 3);
                  }
              
                  function textMouseOut(d){
                    d3.select(this)
                    .attr("stroke-width", 1);
                  }

                    
                  var simulation = d3.forceSimulation().force("center", d3.forceCenter().x(genre_count_width / 2.5).y(genre_count_height / 1.8))
                    .force("charge", d3.forceManyBody().strength(0.2)).force("collide",
                      d3.forceCollide().strength(0.2).radius(function(d) {  return size(data[keys[d.index]]["count"])+1;}).iterations(1) );
                  simulation.nodes(genre_nodes).on("tick", function(d) {circles
                    .attr("cx", function(d) {index_v = keys.indexOf(d);return genre_nodes[index_v].x;})
                    .attr("cy", function(d) {index_v = keys.indexOf(d);return genre_nodes[index_v].y;});
                    texts.attr("x", function(d) {index_v = keys.indexOf(d);return genre_nodes[index_v].x - d.length * 3;})
                          .attr("y", function(d) {index_v = keys.indexOf(d); return genre_nodes[index_v].y;
                      });});

                      var rkeys = Object.keys(color_key);
                      var chart_key = bubble_genre_chart
                      .selectAll("circle_keys")
                      .data(rkeys)
                      .enter()
                      .append("circle")
                      .attr("cx", 700)
                      .attr("cy", function (d){ return 20 +(20 * d); })
                      .attr("r", 5)
                      .attr("id", function(d) {  return "circle_keys";})
                      .attr("fill",  s => color_key[s])
                      .attr("stroke", "#474747")
                      .attr("stroke-width", 1)
                      .on("mouseover",function(d){
                        bubble_genre_chart.selectAll(".big_circle")
                        .style("opacity", 0.1);
                        bubble_genre_chart.selectAll(".big_circle_chart_"+d)
                        .style("opacity", 1);
                      })
                      .on("mouseout", function(d){
                        bubble_genre_chart.selectAll(".big_circle")
                        .style("opacity", 1);
                      });
      
                      var text_keys = bubble_genre_chart
                      .selectAll("texts")
                      .data(rkeys)
                      .enter()
                      .append("text")
                      .text(function(d)  { var next_n =Number(d)+1; return (d)+" to "+ next_n;})
                      .attr("fill","#051D23")
                      .attr("x", 730)
                      .attr("y", function (d){ return 26 +(20 * d); })
})
}
    //This function draws the genre count bar chart 
    function draw_genre_count_bar_chart(year){
        $.get("http://127.0.0.1:5000/get_year_count?year="+year, function(data) {
            var genre_count_height = 500;
            var keys = Object.keys(data)
            var genre_count_width = 46 *keys.length;
            
            if(keys.length > 24){
                genre_count_width = 43 *keys.length;
            }
            console.log(keys);
            var max_value = 0;
                for (d of keys) {
                  if (max_value < data[d]["count"]) {
                    max_value = data[d]["count"];
                  }
                }
                bar_margin = 50
                var bar_chart = exploration_group.append("g").attr("id","second_bar").attr("transform", `translate(${300}, ${bar_margin})`).attr("fill", "#E9F4FF");
                bar_chart.append("rect")
                .attr("text-anchor", "end")
                .attr("x", -60)
                .attr("y", -45 )
                .attr("width", genre_count_width + 70)
                .attr("height", 540)
                .attr("fill","#F2F2F2")
                .attr("stroke","#AAAAAA")
                .attr("stroke-width", 1);
                var yScale = d3.scaleLinear().range([genre_count_height - 50, 0]).domain([0, max_value]);
                bar_chart.append("g").call(d3.axisLeft(yScale));
                var xScale = d3.scaleBand().range([0, genre_count_width]).domain(keys).padding(0.1);

                var myText =  bar_chart.append("text")
                .attr("y", -20)
                .attr("x", 10)
                .text("Genre / Genre Count Bar Graph for "+year)
                .attr("fill", "#474747");

                var xaxis =  bar_chart.append("text")
                .attr("y", -35)
                .attr("x", -250)
                .text("Genre Count")
                .attr("transform","translate(0,0)rotate(270)")
                .attr("fill", "#474747");

                var yaxis =  bar_chart.append("text")
                .attr("y", genre_count_height-20)
                .attr("x", genre_count_width/2.4)
                .text("Genre")
                .attr("fill", "#474747");

                bar_chart
                  .append("g")
                  .attr("transform", `translate(0, ${genre_count_height - 50})`)
                  .call(d3.axisBottom(xScale));
                bar_chart
                  .selectAll()
                  .data(keys)
                  .enter()
                  .append("rect")
                  .attr("x", s => xScale(s))
                  .attr("y", s => yScale(data[s]["count"]))
                  .attr("height", s => genre_count_height - 50 - yScale(data[s]["count"]))
                  .attr("width", xScale.bandwidth())
                  .attr("fill", function(d){ return "#5D80A3"})
                  .attr("stroke", "#474747")
                  .attr("stroke-width", 1)
                  .on("mouseover",textMouseOver)
                  .on("mouseout", textMouseOut)
                  .on("click", bar_click);

                  var texts = bar_chart
                  .selectAll("texts")
                  .data(keys)
                  .enter()
                  .append("text")
                  .text(function(d) {return data[d]["avg_rating"];})
                  .attr("fill","#041D23")
                  .attr("x",  s => xScale(s)+2)
                  .attr("y", s => yScale(data[s]["count"])-5)
                  .on("mouseover",mouse_over)
                  .on("mouseout", mouse_out);

                  function mouse_over(d){
                    data_keys = Object.keys(data);

                    d3.select(this).attr("stroke-width", 4);
                    div_2.transition().duration(200).style("opacity", .9);
                    div_2.html("Average Ratings").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px"); 
                }

                function mouse_out(d){
                    d3.select(this).attr("stroke-width", 1);
                    div_2.transition().duration(500).style("opacity", 0);
                }

                  function bar_click(d){
                    exploration_group.select("#third_bar").remove();
                    draw_bubble_chart(d,year)
                  }
        
                  function textMouseOver(d){
                    d3.select(this)
                    .attr("stroke-width", 3);
                  }
              
                  function textMouseOut(d){
                    d3.select(this)
                    .attr("stroke-width", 1);
                  }
        });
    }
    //This function draws the bubble chart 
    function draw_bubble_chart(genre,year){
        $.get( "/get_year_genre?year="+year+"&genre="+genre, function(data) {
            var keys = Object.keys(data["tconst"])
            var bubble_count_height = 440;
            var bubble_count_width = 55 * Object.keys(data).length;

            var max_y = 10;
            var max_x = 0;
                for (d of keys) {
                    data["runtimeMinutes"][d] = Number(data["runtimeMinutes"][d])
                    if (max_x < data["runtimeMinutes"][d]) {
                        max_x = data["runtimeMinutes"][d];
                    }
                }
                var bar_margin = 740
                var bubble_chart = exploration_group.append("g").attr("id","third_bar").attr("transform", `translate(${330}, ${bar_margin})`).attr("fill", "#E9F4FF");

               var backgroud_rect =  bubble_chart.append("rect")
                .attr("text-anchor", "end")
                .attr("x", -40)
                .attr("y", -40 )
                .attr("width", 930)
                .attr("height", 500)
                .attr("fill","#F2F2F2")
                .attr("stroke","#AAAAAA")
                .attr("stroke-width", 1);

                var yScale = d3.scaleLinear().range([bubble_count_height - 50, 0]).domain([0, max_y]);
                bubble_chart.append("g").call(d3.axisLeft(yScale));
                var xScale = d3.scaleLinear().domain([0, max_x]).range([ 0, bubble_count_width]);
                bubble_chart.append("g").attr("transform", `translate(0, ${bubble_count_height - 50})`).call(d3.axisBottom(xScale));
                var myColor = d3.scaleOrdinal().domain(d3.map(data["numVotes"],function(d) { return d; })).range(d3.schemeBlues[9]);
                
                var color_key = {0:"#f7fbff",1:"#deebf7",2:"#c6dbef",3:"#9ecae1",4:"#6baed6",5:"#4292c6",6:"#2171b5",7:"#08519c",8:"#08306b",9:"#062655"}
                var max_votes = 0;
                var min_votes = 10000000;
                for (d of keys) {
                    data["numVotes"][d] = Number(data["numVotes"][d])
                    if (max_votes < data["numVotes"][d]) {
                        max_votes = data["numVotes"][d];
                    }
                    if (min_votes > data["numVotes"][d]) {
                        min_votes = data["numVotes"][d];
                    }
                }

                var z = d3.scaleSqrt()
                .domain([min_votes, max_votes])
                .range([ 5, 40]);

                var bubble_points = bubble_chart
                .selectAll("points")
                .data(keys)
                .enter()
                .append("circle")
                .attr("cy", s => yScale(data["averageRating"][s]))
                .attr("cx", s => xScale(data["runtimeMinutes"][s]))
                .attr("r", 5)
                .attr("id", function(d) { return "circle_"+d;})
                .attr("class", function(d) {var ratings_key = Math.floor(data["averageRating"][d]); return "scatter_chart_"+ratings_key+" "+"scatter_circle";})
                .attr("fill", function(d){var ratings_key = Math.floor(data["averageRating"][d]); return color_key[ratings_key]})
                .attr("stroke", "#041D23")
                .attr("stroke-width", 1)
                .on("mouseover",mouse_over)
                .on("mouseout", mouse_out);

                var rkeys = Object.keys(color_key);



                function mouse_over(d){
                    data_keys = Object.keys(data);

                    d3.select(this)
                    .attr("stroke-width", 2);
                    div.transition()		
                    .duration(200)		
                    .style("opacity", .9);
                    div.html(function(){ 
                    var html_result= "";
                    for (content of data_keys){
                        html_result = html_result + content +":" + data[content][d]+"<br/>"; 
                    }
                        return html_result}).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px"); 
                }

                function mouse_out(d){
                    d3.select(this).attr("stroke-width", 1);
                    div.transition().duration(500).style("opacity", 0);
                }
                
                var chart_key = bubble_chart
                .selectAll("circle_keys")
                .data(rkeys)
                .enter()
                .append("circle")
                .attr("cx", 700)
                .attr("cy", function (d){ return 20 +(20 * d); })
                .attr("r", 5)
                .attr("id", function(d) {  return "circle_keys";})
                .attr("fill",  s => color_key[s])
                .attr("stroke", "#474747")
                .attr("stroke-width", 1)
                .on("mouseover",function(d){
                  bubble_chart.selectAll(".scatter_circle")
                  .style("opacity", 0.1);
                  bubble_chart.selectAll(".scatter_chart_"+d)
                  .style("opacity", 1);
                })
                .on("mouseout", function(d){
                  bubble_chart.selectAll(".scatter_circle")
                  .style("opacity", 1);
                });

                var texts = bubble_chart
                .selectAll("texts")
                .data(rkeys)
                .enter()
                .append("text")
                .text(function(d)  { var next_n =Number(d)+1; return (d)+" to "+ next_n;})
                .attr("fill","#051D23")
                .attr("x", 730)
                .attr("y", function (d){ return 26 +(20 * d); })

                bubble_chart.append("text")
                .attr("text-anchor", "end")
                .attr("x", 0)
                .attr("y", -20 )
                .text("Average ratings")
                .attr("fill","#051D23")
                .attr("text-anchor", "start");

                bubble_chart.append("text")
                .attr("text-anchor", "end")
                .attr("x", 300)
                .attr("y", -20 )
                .text("Average ratings / Runtime Scatter Plot")
                .attr("fill","#051D23")
                .attr("text-anchor", "start");

                bubble_chart.append("text")
                .attr("text-anchor", "end")
                .attr("x", 270)
                .attr("y", 450 )
                .text("Runtime")
                .attr("fill","#051D23");

          });
    }

// This calls the load chart function on load 
load_exploration_chart()