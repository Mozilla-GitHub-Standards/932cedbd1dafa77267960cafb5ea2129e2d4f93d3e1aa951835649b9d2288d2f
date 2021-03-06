(function($, d3, window, _) { 
    var titles = {
        'User': 15,
        'Pirate': 5,
        'Kitten': 5,
        'Unicorn': 5,
        'Ninja': 5,
        'Whimsy': 4,
        'Matt': 1,
        'Tyler': 1,
        'Portland': 1,
        'fa-beer': 1,
        'fa-star': 1,
        'fa-trophy': 1,
        'fa-comments': 1,
        '&#9760;': 1,
        '用户': 1, 
        'Supercalifragilisticexpialidocious': 1,
        'CrazyPants': 1,
        'Canada': 1,
        'Persona' : 1,
        'Go': 1,
        'KeyboardCat': 1,
        'Odin': 1,
        'Heartbeat': 10,
        'Rock': 1,
        'fa-graduation-cap': 2
    };
    
    var exceptions = {
        'Pirate'    :   ['Arrrvocacy','Arrrvocacy',
                        'Arrrrvocacy','Arrrrrvocacy','Arrrrrrrrrrrvocacy',
                        'Arrrrrrrrrrrrrrrrrrrrrvocacy'],
        'Canada'    :   ['Eh?vocacy'],
        'Go'        :   ['SFGiants', 'Niners', 'Warriors'],
        'Heartbeat' :   [   '&#x2605;&#x2605;&#x2605;&#x2605;&#x2605',
                            '&#x2605;&#x2605;&#x2605;&#x2605;&#x2606',
                            '&#x2605;&#x2605;&#x2605;&#x2606;&#x2606',
                            '&#x2605;&#x2605;&#x2606;&#x2606;&#x2606',
                            '&#x2605;&#x2606;&#x2606;&#x2606;&#x2606'],
        'Rock'      :   ['Climbing', 'AndRoll']
    };
    
    var sum = _.reduce(titles, function (a,w) { return a+w }, 0);
    function randomNavTitle (whimsy) {
        var nav_grey = $('.navbar-brand .large-grey-text');
        var nav_red = $('.navbar-brand .large-red-text');
        if (whimsy) {
            var rand = _.random(0, sum, true);
            var rolling = 0;
            var item;
            _.forIn(titles, function (w,t) {
                rolling += w;
                if (rolling > rand) {
                    item = t;
                    return false;
                }
            });
                        
            if(item.match('^fa\-')) {
                nav_grey.html('<i class="fa '+item+'"></i> ');
                nav_red.text('Advocacy');
            } else if (exceptions[item]) {
                nav_grey.text(item);
                nav_red.html(_.sample(exceptions[item]));
            } else if (item.match('^\&\#')) {
                nav_grey.html('<span style="font-weight: 300">'+item+'</span> ');
                nav_red.text('Advocacy');
            } else {
                nav_grey.text(item);
                nav_red.text('Advocacy');
            }
            
        } else {
            nav_grey.text('User');
            nav_red.text('Advocacy');
        }
    }
    
    function whimsify(whimsy) {
        if (whimsy) {
            $('.container').addClass('whimsy');
        } else {
            $('.container').removeClass('whimsy');
        }
        randomNavTitle(whimsy);
    }
    
    window.addEventListener("message", function (event) {
        if (event.data === 'whimsy:enabled') {
            whimsify(true);
        }
    }, false);
    
    window.whimsify = whimsify
    
}(jQuery, d3, window, _));
