function plot_clusters(url) {
  $.get(url, function(data, status) {
    layout = {
      height: 430,
      width: 710,
      scene: {
        xaxis: { zeroline: false },
        yaxis: { zeroline: false }
      },
      title: ""
    };

    Plotly.plot("directorClusters", {
      data: [data["director"]],
      layout: layout
    });
    Plotly.plot("actorClusters", {
      data: [data["actor"]],
      layout: layout
    });
  });
}
plot_clusters("/movie_clusters");
