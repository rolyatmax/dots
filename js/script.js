
// TO DO
// -----
// * add sound cues as boxes fill in?

(function(){

    ///// Constants

    var CONST = {
        BOX_SIZE: 25,
        LIGHT_GRAY: '#aaaaaa',
        LINE_COLOR: '#bbb',
        DOT_SIZE: 1,
        DRAWERS_COUNT: 15,
        DRAW_SPEED: 0.1,
        FADE_SPEED: 0.1,
        FILLED_BOX_OFFSET: 1,
        MULTI: [
            {r: 129, g: 116, b: 179, a: 0.6},
            {r: 116, g: 150, b: 179, a: 0.6},
            {r: 140, g: 179, b: 116, a: 0.6},
            {r: 179, g: 131, b: 116, a: 0.6}
        ],
        GRAYSCALE: [
            {r: 0, g: 0, b: 0, a: 0.4},
            {r: 0, g: 0, b: 0, a: 0.3},
            {r: 0, g: 0, b: 0, a: 0.2},
            {r: 0, g: 0, b: 0, a: 0.1}
        ],
        MONOBLUE: [
            {r: 115, g: 129, b: 158, a: 0.7},
            {r: 115, g: 129, b: 158, a: 0.5},
            {r: 115, g: 129, b: 158, a: 0.35},
            {r: 115, g: 129, b: 158, a: 0.2}
        ]
    };




    ///// Set Up Canvas with Sketch.js

    var DOTS = Sketch.create({

        container: document.getElementById( 'container' ),
        autostart: false,
        autoclear: false
    });

    DOTS = _.extend(DOTS, CONST, {

        FILL_COLORS: CONST.MONOBLUE,

        setup: function() {

            ///// build the dots

            var x_limit = ceil(this.width / CONST.BOX_SIZE);
            var y_limit = ceil(this.height / CONST.BOX_SIZE);

            for (var x = 0; x < x_limit; x++) {
                for (var y = 0; y < y_limit; y++) {
                    dots.create( x, y );
                }
            }

            ///// build the lines

            var allDots = dots.get();
            for (var i = 0, leng = allDots.length; i < leng; i++) {

                var dot = allDots[i];
                var neighbors = dots.getNeighborsOf( dot );

                lines.create( dot, neighbors[0] );
                lines.create( dot, neighbors[1] );

            }

            ///// build the boxes 
            for (var p = 0; p < leng; p++) {
                var ds = dots.getFourCorners( allDots[p] );
                if (ds.length !== 4) { continue; }
                boxes.create( ds );
            }


            ///// start some drawers
            for (var k = 0; k < CONST.DRAWERS_COUNT; k++) {
                var d = random(allDots);
                drawers.create( d.x, d.y );
            }

            ///// draw the grid

            var q = allDots.length;
            while (q--) {
                allDots[q].draw( this );
            }

        },

        update: function() {
            if (!drawers.getAlive().length) {
                this.reset();
            }
        },

        draw: function() {

            var allDrawers = drawers.get();
            for (var i = 0, len = allDrawers.length; i < len; i++) {
                allDrawers[i].drawToNeighbor();
            }

            var fadingBoxes = boxes.getFading();
            var p = fadingBoxes.length;
            while (p--) {
                fadingBoxes[p].fill( this );
            }

        },

        resize: function() {
            this.reset();
        },

        reset: function() {
            this.stop();
            dots.reset();
            lines.reset();
            drawers.reset();
            boxes.reset();
            this.clear();
            this.setup();
            this.start();
        }

    });




    ////// Setup dat.GUI

    var gui = new dat.GUI();
    gui.add(DOTS, 'DRAWERS_COUNT', 1, 150).step(1).onFinishChange( changeHandler );
    gui.add(DOTS, 'BOX_SIZE', 5, 80).step(1).onFinishChange( changeHandler );
    gui.add(DOTS, 'DRAW_SPEED', 0.05, 1).step(0.01);
    gui.add(DOTS, 'FADE_SPEED', 0.05, 0.5).step(0.01);
    gui.add(DOTS, 'FILL_COLORS', { MonoBlue: 'MONOBLUE', Grayscale: 'GRAYSCALE', Multi: 'MULTI' }).onFinishChange( changeColor );
    gui.add(DOTS, 'reset');

    function changeHandler(val) {
        DOTS.reset();
    }
    function changeColor(val) {
        DOTS.FILL_COLORS = DOTS[val];
    }




    ///// Exports
    window.DOTS = DOTS;

})();