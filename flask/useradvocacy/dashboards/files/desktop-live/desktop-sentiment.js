var heartbeat_rating_chart = timeScaleLine()
    .y(function(d) {
        return d.heartbeat_average
    })
    .ylabel("Rating")
    .ymin(1)
    .ymax(5)
    .colors(["#B2EAF8"])
    .legend(false);
    
var heartbeat_response_chart = timeScaleLine()
    .y(function(d) {
        return d.heartbeat_responses_rate
    })
    .ymin(0)
    .ymax(100)
    .ylabel("Percentage")
    .colors(["#00B8E6"])
    .legend(false);



var input_by_time_chart = timeScaleLine()
    .y(function(d) {
        return d.value * 100
    })
    .ylabel("Score")
    .colors(["#B2EAF8", "#00B8E6"])
    .legend(false);

var input_sentiment_chart = sentimentChart()
    .y(function(d) {
        if (d.adis === null || d.adis == 0){
            return 0
        } else {
            return d.input_volume/d.adis * 1000000
        }
    })
    .ylabel("Input per million ADI")
    .colorfunc(function(d) {
        return d.input_average * 2;
    });

/*TODO: refactor this whole thing to use promises.*/

var annoter = makeAnnotations();
d3.json("/data/static/json/desktop-annotations.json", function(note_data) {

    notes = annoter(note_data);
    heartbeat_rating_chart.annotations(notes);
    heartbeat_response_chart.annotations(notes);
    input_by_time_chart.annotations(notes);
    input_sentiment_chart.annotations(notes);
  
    d3.json("/data/api/v1/stats?measures=heartbeat_average&period_delta=90&products=Firefox&channels=all", function(data) {
        results = [{name:"Average Rating", values: data.results}];
        d3.select("#chart1")
            .datum(results)
            .call(heartbeat_rating_chart)
    });   

    d3.json("/data/api/v1/stats?measures=heartbeat_response_rate&period_delta=90&products=Firefox&channels=all", function(data) {
        results = [{name:"Response rate", values: data.results}];
        d3.select("#chart2")
            .datum(results)
            .call(heartbeat_response_chart)
    }); 

    d3.json("/data/api/v1/stats?measures=input_average&period_delta=90&products=Firefox&channels=all", function(data) {
        final_data = [
            {
                name: "Input rating",
                values: []
            },
            {
                name: "7-day average",
                values: []
            }
        ];

        temp_array = [];

        for(i = 0; i < data.results.length; i++){
            item = {};
            item.date = data.results[i].date;
            item.value = data.results[i].input_average;
            final_data[0].values.push(item);
            temp_array.push(item);
            if (temp_array.length >= 7) {
                sum = _.reduce(temp_array, function (s, n) { return s + n.value }, 0);
                roll_item = {
                    date: item.date,
                    value: sum/7
                };
                final_data[1].values.push(roll_item);
                temp_array.shift();
            }
        }
        d3.select("#chart3")
            .datum(final_data)
            .call(input_by_time_chart);
    });

    d3.json("/data/api/v1/stats?measures=input_average,input_volume,adis&period_delta=90&products=Firefox&channels=all", function(data) {
        results = data.results;
        d3.select("#chart4")
            .datum(results)
            .call(input_sentiment_chart)
    });

});

var input_by_version_chart = barChart()
    .x(function(d) {
        return d.version;
    })
    .y(function(d) {
        return d.input_average * 100;
    })
    .ymax(20)
    .xtooltip(function(d) {
        return d.version;
    })
    .bartip(function(d) {
        return "Versions: " + d.version + "  Score: " + (d.input_average*100).toFixed(2);
    })
    .xlabel("Version")
    .ylabel("Score")
    .fillcolor("#E68A2E");

d3.json("/data/api/v1/stats?measures=input_average&period=version&period_delta=10&products=Firefox&channels=release", function(data) {
    results = data.results;
    d3.select("#chart5")
        .datum(results)
        .call(input_by_version_chart);
});

var oldFormat = d3.time.format("%Y-%m-%d");
var newFormat = d3.time.format("%-m/%-d");

var sumo_volume_chart = barChart()
    .x(function(d) {
        return newFormat(oldFormat.parse(d.date));
    })
    .y(function(d) {
        return d.sumo_inproduct_visits/1000;
    })
    .ymax(3000)
    .xtooltip(function(d) {
        return d.date;
    })
    .bartip(function(d) {
        return "Week of " + d.date + ": " + d.sumo_inproduct_visits + " support visits";
    })
    .xlabel("Week of")
    .ylabel("Support Visits ('000s)")
    .fillcolor("#3366FF")
    .margin({
        top: 20,
        right: 20,
        bottom: 40,
        left: 45
    });

d3.json("/data/api/v1/stats?measures=sumo_inproduct_visits&period=week&products=Firefox&period_delta=12&channels=all", function(data) {
    results = data.results;
    d3.select("#chart6")
        .datum(results)
        .call(sumo_volume_chart);
});

$(window).resize(_.debounce(function() {
    d3.select("#chart1").call(heartbeat_rating_chart);
    d3.select("#chart2").call(heartbeat_response_chart);
    d3.select("#chart3").call(input_by_time_chart);
    d3.select("#chart4").call(input_sentiment_chart);
    d3.select("#chart5").call(input_by_version_chart);
    d3.select("#chart6").call(sumo_volume_chart);
}, 300));
