(function(){

    ///// Constants

    var BOX_SIZE = 20;
    var LIGHT_GRAY = '#bbbbbb';


    ///// Classes

    var Dot = function( x, y ) {
        this.id = 'd' + x + '-' + y;
        this.x = x * BOX_SIZE;
        this.y = y * BOX_SIZE;
    };

    Dot.prototype = {
        draw: function(ctx) {
            ctx.fillStyle = LIGHT_GRAY;
            ctx.fillRect( this.x, this.y, 1, 1 );
            return this;
        }
    };

    var Line = function( dot1, dot2 ) {

    };

    var Box = function( line1, line2, line3, line4 ) {

    };

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
            _dots[dot.x] = _dots[dot.x] || {};
            _dots[dot.x][dot.y] = dot;

            _length += 1;
        }

        function get( x, y ) {

            if (typeof x !== 'number' || typeof y !== 'number') {
                return flatten();
            }

            return _dots[x] && _dots[x][y];
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

    ///// Variables

    var lines = [];

    ///// Start Up

    var DOTS = Sketch.create({
        container: document.getElementById( 'container' ),
        autostart: false
    });

    DOTS.setup = function() {

        ///// build the dots

        var x_limit = (DOTS.width / BOX_SIZE) | 0;
        
        while (x_limit--) {
            
            var y_limit = (DOTS.height / BOX_SIZE) | 0;
            
            while (y_limit--) {
                dots.add( new Dot( x_limit, y_limit ) );
            }
        }


        ///// build the lines

        for (var i = 0, leng = dots.length(); i < leng; i++) {

        }

        console.log('started with : ', dots);
    };

    DOTS.update = function() {

    };

    DOTS.draw = function() {

        var leng = dots.length();
        var allDots = dots.get();
        while (leng--) {
            allDots[leng].draw( DOTS );
        }

    };


    ///// Exports

    window.DOTS = DOTS;

})();