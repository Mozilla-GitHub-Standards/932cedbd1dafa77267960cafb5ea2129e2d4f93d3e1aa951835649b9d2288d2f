(function($, d3, window, _) {

var android = inputTrendLines('android_conf.json')
    .extra_params(['date_delta=180d', 'products=Firefox for Android', 'locales=en-US', 'happy=0'])
    .link_base('https://input.mozilla.org/en-US/?product=Firefox for Android&locale=en-US&happy=0&');
var annoter = makeAnnotations();
var noteP = d3.jsonPromise("/data/static/json/mobile-annotations.json")
    .done(function(note_data) {
        notes = annoter(note_data);
        android.annotations(notes);
        d3.select('#issue-list').call(android);
    })

}(jQuery, d3, window, _));
