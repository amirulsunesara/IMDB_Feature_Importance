//  Referenced from : https://www.codexworld.com/multi-select-dropdown-list-with-checkbox-jquery/

let dictMetrics = {};
let dictAbsGlobal = {};
let rowCount = 0;
let dictAbs = {};

//initilize jquery multiselect
$("#features").multiselect({
  columns: 1,
  placeholder: "Select Features",
  selectAll: true
});

//on train click
$("#features")
  .siblings("button.btnTrain")
  .click(function(event) {
    event.preventDefault();
    let selectedValues = $(this)
      .siblings("select[multiple]")
      .val();

    $(".fa-circle-notch").removeClass("loader");
    $.get("/model_training/" + selectedValues, function(dataDict, err) {
      $(".fa-circle-notch").addClass("loader");
      dictAbs = dataDict["absolute_error"];
      plotAbs(dataDict);
      rowCount += 1;
      let html = '<tr><th scope="row">' + rowCount + "</th>";
      html += "<td style='word-break: break-all;'>" + selectedValues + "</td>";
      let data = dataDict["score_list"];
      dictMetrics[rowCount] = dataDict["features"];
      dictAbsGlobal[rowCount] = dictAbs;

      data.forEach(element => {
        if (element["name"] == "r2_score") {
          $("#r2score").html(parseFloat(element["value"]).toPrecision(2));
          html +=
            "<td>" + parseFloat(element["value"]).toPrecision(2) + "</td>";
        } else if (element["name"] == "mean_sq_error") {
          $("#mse").html(parseFloat(element["value"]).toPrecision(2));
          html +=
            "<td>" + parseFloat(element["value"]).toPrecision(2) + "</td>";
        } else if (element["name"] == "rmse") {
          $("#rmse").html(parseFloat(element["value"]).toPrecision(2));
          html +=
            "<td>" + parseFloat(element["value"]).toPrecision(2) + "</td>";
        }
      });

      let buttonId = "btn-" + rowCount;
      html +=
        '<td><button onclick="plotCorr(' +
        rowCount +
        ')" class="btn btn-primary showPlot" id="' +
        buttonId +
        '">Show Plot</button></td></td></tr>';
      $("#tlog").append(html);
      $("#correlation_bar_graph").html("");

      draw_correlation_bar_graph(dataDict["features"]);
    });
  });

//plot feature importance plot
function plotCorr(id) {
  let data = dictMetrics[id];
  dictAbs = dictAbsGlobal[id];
  $("#correlation_bar_graph").html("");
  $("#actualPredicted").html("");
  updatePlot(1997);
  draw_correlation_bar_graph(data);
}

//plot abs error plot
function plotAbs(dataDict) {
  let yearData = dataDict["absolute_error"];
  let years = Object.keys(yearData);
  let html = "";
  years.forEach(a => {
    html +=
      '<a class="dropdown-item" onclick="updatePlot(' + a + ')">' + a + "</a>";
  });
  $("#ddYears").html(html);
  updatePlot(1997);
}

//update plot when different plot is selected to view
function updatePlot(year) {
  let currentData = dictAbs[year];
  let rows = [];
  let count = 0;
  currentData.forEach(a => {
    rows.push(count);
    count++;
  });
  currentData.sort();
  var trace2 = {
    x: rows,
    y: currentData,
    mode: "lines",
    name: "Lines"
  };

  var data = [trace2];

  var layout = {
    title: year,
    xaxis: {
      title: {
        text: "Movie Instance"
      }
    },
    yaxis: {
      title: {
        text: "Absolute Error of Ratings"
      }
    }
  };

  Plotly.newPlot("actualPredicted", data, layout);
}

$(".btnTrain").click();
