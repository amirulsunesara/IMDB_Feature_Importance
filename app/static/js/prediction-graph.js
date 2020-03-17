$.get("/prediction_result",function(data){

    var trace1 = {
      x: data.numVotes,
      y: data.ytest,
      mode: 'markers',
      type: 'scattergl',
      name: 'numVotes',
      marker: {
        line: {
            width: 1,
            color: '#404040'}
    }
    };
    
    var trace2 = {
      x: data.numVotes,
      y: data.preds,
      mode: 'markers',
      type: 'scattergl',
      name: 'predicted'
    };
    
  
   var data = [trace1,trace2];
    
    var layout = {
  
      height: 500,
      width: 550,
      
      xaxis: {
        showgrid: false,
        range: [ -0.1, 1.2 ]
      },
      yaxis: {
        showgrid: false,
        range: [-0.1, 1.2]
      },
      title:'Actual Vs Prediction'
    };
  
    Plotly.newPlot('prediction-chart1', {
      data: data,
      layout: layout
    });
  
  });