(function(){

    ///// Constants

    var BOX_SIZE = 20;
    var LIGHT_GRAY = '#999999';
    var LIGHTER_GRAY = '#bbbbbb';
    var DOT_SIZE = 1;
    var DRAWERS_COUNT = 2;

    ///// Classes

    var Dot = function( x, y ) {
        this.id = 'd-x' + x + 'y' + y;
        this.x = x;
        this.y = y;
    };

    Dot.prototype = {
        draw: function(ctx) {
            var coords = this.coords();

            ctx.fillStyle = LIGHT_GRAY;
            ctx.fillRect( coords.x, coords.y, DOT_SIZE, DOT_SIZE );
            return this;
        },
        coords: function() {
            return {
                x: this.x * BOX_SIZE,
                y: this.y * BOX_SIZE
            };
        }
    };

    var Line = function( dot1, dot2 ) {
        this.id = _.uniqueId('l');
        this.dot1 = dot1;
        this.dot2 = dot2;
    };

    Line.prototype = {
        draw: function(ctx) {
            var coords1 = this.dot1.coords();
            var coords2 = this.dot2.coords();

            ctx.strokeStyle = LIGHTER_GRAY;
            ctx.beginPath();
            ctx.moveTo(coords1.x, coords1.y);
            ctx.lineTo(coords2.x, coords2.y);
            ctx.stroke();
        }
    };

    var Box = function( line1, line2, line3, line4 ) {

    };


    ///// Dots Collection

    var dots = (function(){

        var _dots = {};
        var _length = 0;

        function flatten() {
            var allDots = [];

            for (var x in _dots) {
                if (_dots.hasOwnProperty(x)) {

                    for (var y in _dots[x]) {
                        if (_dots[x].hasOwnProperty(y)) {

                            allDots.push( _dots[x][y] );

                        }
                    }
                }
            }

            return allDots;
        }

        function add( dot ) {
            if (!dot) { return; }
            if (typeof dot.x !== 'number' || typeof dot.y !== 'number') { return; }

            var x = 'x' + dot.x;
            var y = 'y' + dot.y;

            _dots[x] = _dots[x] || {};
            _dots[x][y] = dot;

            _length += 1;
        }

        function get( x, y ) {

            if (typeof x !== 'number' || typeof y !== 'number') {
                return flatten();
            }

            x = 'x' + x;
            y = 'y' + y;

            return _dots[x] && _dots[x][y];
        }

        function length() {
            return _length;
        }

        // returns two neighbors (the neighbor below and to the right)
        function getNeighborsOf(dot) {
            var neighbors = [];
            neighbors.push( get(dot.x + 1, dot.y) );
            neighbors.push( get(dot.x, dot.y + 1) );
            return neighbors;
        }

        // returns all four neighbors)
        function getAllNeighborsOf(dot) {
            var neighbors = [];
            neighbors.push( get(dot.x + 1, dot.y) );
            neighbors.push( get(dot.x, dot.y + 1) );
            neighbors.push( get(dot.x - 1, dot.y) );
            neighbors.push( get(dot.x, dot.y - 1) );
            return neighbors;
        }


        return {
            add: add,
            get: get,
            length: length,
            getNeighborsOf: getNeighborsOf,
            getAllNeighborsOf: getAllNeighborsOf
        };
    })();


    ///// Lines Collection

    var lines = (function(){

        var _lines = {};
        var _length = 0;

        function flatten() {
            var allLines = [];

            for (var x in _lines) {
                if (_lines.hasOwnProperty(x)) {

                    for (var y in _lines[x]) {
                        if (_lines[x].hasOwnProperty(y)) {

                            allLines.push( _lines[x][y] );

                        }
                    }
                }
            }

            return allLines;
        }

        function add( line ) {
            var dot1 = line.dot1;
            var dot2 = line.dot2;

            if (!dot1 || !dot2) { return; }

            _lines[dot1.id] = _lines[dot1.id] || {};
            _lines[dot1.id][dot2.id] = line;

            _length += 1;
        }

        // doesn't matter what order dot1 and dot2 are passed in
        function get( dot1, dot2 ) {

            if (!dot1 || !dot2) {
                return flatten();
            }

            if (_lines[dot1.id] && _lines[dot1.id][dot2.id]) {
                return _lines[dot1.id][dot2.id];
            } else {
                return _lines[dot2.id] && _lines[dot2.id][dot1.id];
            }

        }

        function length() {
            return _length;
        }

        return {
            add: add,
            get: get,
            length: length
        };
    })();


    ///// Drawers Collection

    var drawers = (function(){

        var _drawers = [];
        var _lines = [];

        function create( x, y ) {
            // if x and y are coords, then get the dot from the collection
            // otherwise, assume that x is a dot
            var dot = (typeof x === 'number' && typeof y === 'number') ? dots.get(x, y) : x;

            var drawer = new Drawer( dot );
            _drawers.push( drawer );

        }

        // check to see if the line passed in is already in the lines array
        function checkLines(line) {
            if (!line || !line.id) return false;
            for (var i = 0, len = _lines.length; i < len; i++) {
                if (line.id === _lines[i].id) return true;
            }
            return false;
        }

        function get() {
            return _drawers;
        }

        function removeDrawer( drawer ) {
            var i = _.indexOf(_drawers, drawer);
            _drawers.splice( i, 1);
        }

        ///// Drawer Class

        var Drawer = function( startingDot ) {
            this.location = startingDot;
            this.dead = false;
            this.id = _.uniqueId();
        };

        Drawer.prototype = {
            drawToNeighbor: function() {
                if (this.dead) return;

                var current = this.location;

                var neighbors = dots.getAllNeighborsOf(current);

                var someLines = _.map(neighbors, function(dot){
                    if (!dot) return false;
                    var line = lines.get(dot, current);
                    if (!line) return false;
                    if (checkLines(line)) return false;
                    return line;
                });

                someLines = _.compact(someLines);

                if (!someLines.length) {
                    return this.remove();
                }

                var i = random(someLines.length) | 0;
                var line = someLines[i];
                line.draw(DOTS);

                _lines.push(line);

                var dot = (line.dot1 === this.location) ? line.dot2 : line.dot1;
                this.location = dot;
            },
            remove: function() {
                this.dead = true;
                // removeDrawer(this);
            }
        };


        return {
            create: create,
            get: get
        };
    })();


    ///// Start Up

    var DOTS = Sketch.create({
        container: document.getElementById( 'container' ),
        autostart: false,
        autoclear: false
    });

    DOTS.setup = function() {

        ///// build the dots

        var x_limit = ceil(DOTS.width / BOX_SIZE);
        var y_limit = ceil(DOTS.height / BOX_SIZE);
        
        for (var x = 0; x < x_limit; x++) {
            for (var y = 0; y < y_limit; y++) {
                dots.add( new Dot( x, y ) );
            }
        }

        ///// build the lines

        var allDots = dots.get();
        for (var i = 0, leng = allDots.length; i < leng; i++) {

            var dot = allDots[i];
            var neighbors = dots.getNeighborsOf( dot );

            lines.add( new Line(dot, neighbors[0]) );
            lines.add( new Line(dot, neighbors[1]) );

        }

        ///// start some drawers
        for (var k = 0; k < DRAWERS_COUNT; k++) {
            var d = random(allDots);
            drawers.create( d.x, d.y );
        }

    };

    DOTS.update = function() {
    };

    DOTS.draw = function() {

        var allDots = dots.get();
        var leng = allDots.length;
        while (leng--) {
            allDots[leng].draw( DOTS );
        }

        var allDrawers = drawers.get();
        for (var i = 0, len = allDrawers.length; i < len; i++) {
            allDrawers[i].drawToNeighbor();
        }

    };


    ///// Exports

    window.DOTS = DOTS;
    window.dots = dots;
    window.lines = lines;
    window.drawers = drawers;

})();