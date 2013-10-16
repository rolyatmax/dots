
// TO DO
// -----
// * separate into a few different files
// * examine performance issues re: # of dots


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


    ///// Classes

    var Color = function( opts ) {
        opts = opts || {};
        this.r = opts.r;
        this.g = opts.g;
        this.b = opts.b;
        this.a = opts.a;
        this.box = opts.box;
        this.cur_alpha = 0;
    };

    Color.prototype = {
        toRGBA: function() {
            var levels = [ this.r, this.g, this.b, this.cur_alpha ];
            return 'rgba(' + levels.join(',') + ')';
        },

        fadeInStep: function() {
            var da = (this.a - this.cur_alpha) * CONST.FADE_SPEED;
            this.cur_alpha += da;
            if (da < 0.00001) {
                this.cur_alpha = this.a;
                if (this.box) this.box.fadeComplete();
            }
            return this;
        }
    };

    var Dot = function( x, y ) {
        this.id = 'd-x' + x + 'y' + y;
        this.x = x;
        this.y = y;
    };

    Dot.prototype = {
        draw: function(ctx) {
            var coords = this.coords();

            ctx.fillStyle = CONST.LIGHT_GRAY;
            ctx.fillRect( coords.x, coords.y, CONST.DOT_SIZE, CONST.DOT_SIZE );
            return this;
        },
        coords: function() {
            return {
                x: this.x * CONST.BOX_SIZE,
                y: this.y * CONST.BOX_SIZE
            };
        }
    };

    var Line = function( dot1, dot2 ) {
        this.id = _.uniqueId('l');
        this.dot1 = dot1;
        this.dot2 = dot2;
        this.boxes = [];
        this.drawn = false;
    };

    Line.prototype = {
        draw: function(ctx) {
            var coords1 = this.dot1.coords();
            var coords2 = this.dot2.coords();

            ctx.strokeStyle = CONST.LINE_COLOR;
            ctx.beginPath();
            ctx.moveTo(coords1.x, coords1.y);
            ctx.lineTo(coords2.x, coords2.y);
            ctx.stroke();

            this.drawn = true;
        },

        setPointerToBox: function(box) {
            this.boxes.push(box);
        },

        alertBoxes: function() {
            var len = this.boxes.length;
            while (len--) {
                this.boxes[len].lineDrawn();
            }
        }
    };

    var Box = function( dot1, dot2, dot3, dot4 ) {
        this.id = _.uniqueId('b');
        this.dots = [];
        this.fading = false;

        this.lines = [
            lines.get(dot1, dot2),
            lines.get(dot2, dot3),
            lines.get(dot3, dot4),
            lines.get(dot4, dot1)
        ];

        this.lines = _.compact(this.lines);
        if (this.lines.length !== 4) {
            return;
        }

        // set pointers on the lines back to this box
        // and setup the dots array
        for (var i = 0, len = this.lines.length; i < len; i++) {
            this.lines[i].setPointerToBox(this);
            this.dots.push(this.lines[i].dot1);
            this.dots.push(this.lines[i].dot2);
        }

        this.dots = _.uniq(this.dots);
    };

    Box.prototype = {
        // returns the upper LH dot of the box
        getOriginDot: function() {
            var originDot;
            var len = this.dots.length;
            while (len--) {
                var dot = this.dots[len];
                originDot = originDot || dot;
                if (dot.x < originDot.x || dot.y < originDot.y) {
                    originDot = dot;
                }
            }
            this.originDot = originDot;
            return originDot;
        },

        checkDrawnLines: function() {
            var len = this.lines.length;
            while (len--) {
                if (!this.lines[len].drawn) { return false; }
            }
            return true;
        },

        fill: function(ctx) {
            /// get the upper LH dot
            var dot = this.originDot || this.getOriginDot();
            var coords = dot.coords();
            ctx.beginPath();
            ctx.rect(coords.x + 1, coords.y + 1, CONST.BOX_SIZE - 2, CONST.BOX_SIZE - 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.rect(coords.x, coords.y, CONST.BOX_SIZE, CONST.BOX_SIZE);
            ctx.fillStyle = this.color.fadeInStep().toRGBA();
            ctx.fill();
        },

        lineDrawn: function() {
            if (this.checkDrawnLines()) {
                this.startFade();
            }
        },

        startFade: function() {
            var color_data = random(DOTS.FILL_COLORS);
            color_data.box = this;
            this.color = new Color( color_data );
            this.fading = true;
            boxes.addToFading(this);
        },

        fadeComplete: function() {
            this.fading = false;
            boxes.removeFromFading(this);
        }
    };

    ///// Dots Collection

    var dots = (function(){

        var _dots = {};
        var _length = 0;
        var _dots_array = [];

        function add( dot ) {
            if (!dot) { return; }
            if (typeof dot.x !== 'number' || typeof dot.y !== 'number') { return; }

            var x = 'x' + dot.x;
            var y = 'y' + dot.y;

            _dots[x] = _dots[x] || {};
            _dots[x][y] = dot;

            _dots_array.push(dot);

            _length += 1;
        }

        function get( x, y ) {

            if (typeof x !== 'number' || typeof y !== 'number') {
                return _dots_array;
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
            if (dot.neighbors) return dot.neighbors;

            var neighbors = [];
            neighbors.push( get(dot.x + 1, dot.y) );
            neighbors.push( get(dot.x, dot.y + 1) );
            neighbors.push( get(dot.x - 1, dot.y) );
            neighbors.push( get(dot.x, dot.y - 1) );

            dot.neighbors = neighbors;
            return neighbors;
        }

        // with 'dot' as the upper LH corner, get the next 3 dots that make up the box
        function getFourCorners(dot) {
            if (dot.corners) return dot.corners;

            var corners = [
                dot,
                get( dot.x + 1, dot.y ),
                get( dot.x + 1, dot.y + 1 ),
                get( dot.x, dot.y + 1)
            ];
            dot.corners = _.compact(corners);
            return dot.corners;
        }

        function reset() {
            _dots = {};
            _length = 0;
            _dots_array = [];
        }

        return {
            add: add,
            get: get,
            length: length,
            getNeighborsOf: getNeighborsOf,
            getAllNeighborsOf: getAllNeighborsOf,
            getFourCorners: getFourCorners,
            reset: reset
        };
    })();


    ///// Lines Collection

    var lines = (function(){

        var _lines = {};
        var _length = 0;
        var _lines_array = [];

        function add( line ) {
            var dot1 = line.dot1;
            var dot2 = line.dot2;

            if (!dot1 || !dot2) { return; }

            _lines[dot1.id] = _lines[dot1.id] || {};
            _lines[dot1.id][dot2.id] = line;

            _lines_array.push(line);

            _length += 1;
        }

        // doesn't matter what order dot1 and dot2 are passed in
        function get( dot1, dot2 ) {

            if (!dot1 || !dot2) {
                return _lines_array;
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

        function reset() {
            _lines = {};
            _length = 0;
            _lines_array = [];
        }

        return {
            add: add,
            get: get,
            length: length,
            reset: reset
        };
    })();


    ///// Lines Collection

    var boxes = (function(){

        var _boxes = [];
        var _length = 0;
        var _fading_boxes = [];

        function add( box ) {
            if (!box) { return; }

            _boxes.push(box);

            _length += 1;
        }

        function get() {
            return _boxes;
        }

        function getFading() {
            return _fading_boxes;
        }

        function removeFromFading(box) {
            var i = _.indexOf(_fading_boxes, box);
            _fading_boxes.splice( i, 1);
        }

        function addToFading(box) {
            _fading_boxes.push(box);
        }

        function length() {
            return _length;
        }

        function reset() {
            _boxes = [];
            _length = 0;
            _fading_boxes = [];
        }

        return {
            add: add,
            get: get,
            length: length,
            reset: reset,
            getFading: getFading,
            removeFromFading: removeFromFading,
            addToFading: addToFading
        };
    })();




    ///// Drawers Collection

    var drawers = (function(){

        var _drawers = [];
        var _lines = [];
        var _alive = [];

        function create( x, y ) {
            // if x and y are coords, then get the dot from the collection
            // otherwise, assume that x is a dot
            var dot = (typeof x === 'number' && typeof y === 'number') ? dots.get(x, y) : x;

            var drawer = new Drawer( dot );
            _drawers.push( drawer );
            addToAlive( drawer );

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

        function addToAlive( drawer ) {
            _alive.push( drawer );
        }

        function removeFromAlive( drawer ) {
            var i = _.indexOf(_alive, drawer);
            _alive.splice( i, 1);
        }

        function getAlive() {
            return _alive;
        }

        function reset() {
            _drawers = [];
            _lines = [];
        }

        ///// Drawer Class

        var Animator = function(dot1, dot2, line, drawer) {
            this.drawer = drawer;
            this.line = line;
            this.destDot = dot2;
            this.next = dot1.coords();
            this.coords2 = dot2.coords();
            this.cur = {};
            this.complete = false;
        };

        Animator.prototype = {
            update: function() {
                if (this.complete) return;

                this.cur = {
                    x: this.next.x,
                    y: this.next.y
                };

                var dx = (this.coords2.x - this.cur.x) * CONST.DRAW_SPEED;
                var dy = (this.coords2.y - this.cur.y) * CONST.DRAW_SPEED;

                if (abs(dx) < 0.05 && abs(dy) < 0.05) {
                    this.next = this.coords2;
                    this.draw(DOTS);
                    this.drawer.completedAnimation();
                    return;
                }

                this.next = {
                    x: this.cur.x + dx,
                    y: this.cur.y + dy
                };

                this.draw(DOTS);
            },

            draw: function(ctx) {

                ctx.strokeStyle = CONST.LINE_COLOR;
                ctx.beginPath();
                ctx.moveTo(this.cur.x, this.cur.y);
                ctx.lineTo(this.next.x, this.next.y);
                ctx.stroke();

            }
        };

        var Drawer = function( startingDot ) {
            this.location = startingDot;
            this.dead = false;
            this.animating = false;
            this.id = _.uniqueId();
        };

        Drawer.prototype = {
            drawToNeighbor: function() {
                if (this.dead) return;

                if (this.animator) {
                    this.animator.update();
                    return;
                }

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

                _lines.push(line);

                var destDot = (line.dot1 === this.location) ? line.dot2 : line.dot1;
                this.animator = new Animator(this.location, destDot, line, this);

            },
            completedAnimation: function() {
                this.location = this.animator.destDot;
                this.animator.line.drawn = true;
                this.animator.line.alertBoxes();
                this.animator = null;
            },
            remove: function() {
                removeFromAlive( this );

                this.dead = true;
                // removeDrawer(this);
            }
        };

        return {
            create: create,
            get: get,
            reset: reset,
            getAlive: getAlive,
            removeFromAlive: removeFromAlive,
            addToAlive: addToAlive
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

        var x_limit = ceil(DOTS.width / CONST.BOX_SIZE);
        var y_limit = ceil(DOTS.height / CONST.BOX_SIZE);

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

        ///// build the boxes 
        for (var p = 0; p < leng; p++) {
            var ds = dots.getFourCorners( allDots[p] );
            if (ds.length !== 4) { continue; }
            boxes.add(new Box( ds[0], ds[1], ds[2], ds[3] ) );
        }


        ///// start some drawers
        for (var k = 0; k < CONST.DRAWERS_COUNT; k++) {
            var d = random(allDots);
            drawers.create( d.x, d.y );
        }

        ///// draw the grid

        var q = allDots.length;
        while (q--) {
            allDots[q].draw( DOTS );
        }

    };

    DOTS.update = function() {
        if (!drawers.getAlive().length) {
            DOTS.reset();
        }
    };

    DOTS.draw = function() {

        var allDrawers = drawers.get();
        for (var i = 0, len = allDrawers.length; i < len; i++) {
            allDrawers[i].drawToNeighbor();
        }

        var fadingBoxes = boxes.getFading();
        var p = fadingBoxes.length;
        while (p--) {
            fadingBoxes[p].fill(DOTS);
        }

    };

    DOTS.reset = function() {
        DOTS.stop();
        dots.reset();
        lines.reset();
        drawers.reset();
        boxes.reset();
        DOTS.clear();
        DOTS.setup();
        DOTS.start();
    };

    DOTS.FILL_COLORS = CONST.MONOBLUE;

    ////// Setup dat.GUI

    var gui = new dat.GUI();
    gui.add(CONST, 'DRAWERS_COUNT', 1, 150).step(1).onFinishChange( changeHandler );
    gui.add(CONST, 'BOX_SIZE', 5, 80).step(1).onFinishChange( changeHandler );
    gui.add(CONST, 'DRAW_SPEED', 0.05, 1).step(0.01);
    gui.add(CONST, 'FADE_SPEED', 0.05, 0.5).step(0.01);
    gui.add(DOTS, 'FILL_COLORS', { MonoBlue: 'MONOBLUE', Grayscale: 'GRAYSCALE', Multi: 'MULTI' }).onFinishChange( changeColor );
    gui.add(DOTS, 'reset');

    function changeHandler(val) {
        DOTS.reset();
    }
    function changeColor(val) {
        DOTS.FILL_COLORS = CONST[val];
    }
    ///// Exports

    window.DOTS = DOTS;
    window.dots = dots;
    window.lines = lines;
    window.drawers = drawers;

})();