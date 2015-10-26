import _ from 'underscore';
import lines from './lines';
import {settings} from './settings';

let {FILLED_BOX_OFFSET, FADE_SPEED, BOX_SIZE, FILL_COLORS} = settings;

class Color {
    constructor(opts) {
        opts = opts || {};
        this.r = opts.r;
        this.g = opts.g;
        this.b = opts.b;
        this.a = opts.a;
        this.box = opts.box;
        this.curAlpha = 0;
    }

    toRGBA() {
        let levels = [ this.r, this.g, this.b, this.curAlpha ];
        return 'rgba(' + levels.join(',') + ')';
    }

    fadeInStep() {
        let da = (this.a - this.curAlpha) * FADE_SPEED;
        this.curAlpha += da;
        if (da < 0.00001) {
            this.curAlpha = this.a;
            if (this.box) { this.box.fadeComplete(); }
        }
        return this;
    }
}


class Box {
    constructor(dot1, dot2, dot3, dot4) {
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
        for (let i = 0, len = this.lines.length; i < len; i++) {
            this.lines[i].setPointerToBox(this);
            this.dots.push(this.lines[i].dot1);
            this.dots.push(this.lines[i].dot2);
        }

        this.dots = _.uniq(this.dots);
    }

    // returns the upper LH dot of the box
    getOriginDot() {
        let originDot;
        let len = this.dots.length;
        while (len--) {
            let dot = this.dots[len];
            originDot = originDot || dot;
            if (dot.x < originDot.x || dot.y < originDot.y) {
                originDot = dot;
            }
        }
        this.originDot = originDot;
        return originDot;
    }

    checkDrawnLines() {
        let len = this.lines.length;
        while (len--) {
            if (!this.lines[len].drawn) { return false; }
        }
        return true;
    }

    fill(ctx) {
        /// get the upper LH dot
        let dot = this.originDot || this.getOriginDot();
        let coords = dot.coords();
        let offset = FILLED_BOX_OFFSET;
        let dimen = BOX_SIZE - (offset * 2);
        ctx.beginPath();
        ctx.rect(coords.x + offset, coords.y + offset, dimen, dimen);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.rect(coords.x, coords.y, BOX_SIZE, BOX_SIZE);
        ctx.fillStyle = this.color.fadeInStep().toRGBA();
        ctx.fill();
    }

    lineDrawn() {
        if (this.checkDrawnLines()) {
            this.startFade();
        }
    }

    startFade() {
        let colorData = random(FILL_COLORS);
        colorData.box = this;
        this.color = new Color(colorData);
        this.fading = true;
        addToFading(this);
    }

    fadeComplete() {
        this.fading = false;
        removeFromFading(this);
    }
}


let _boxes = [];
let _fadingBoxes = [];

function create(cornerDots) {
    add(new Box(cornerDots[0], cornerDots[1], cornerDots[2], cornerDots[3]));
}

function add(box) {
    if (!box) { return; }
    _boxes.push(box);
}

function get() {
    return _boxes;
}

function getFading() {
    return _fadingBoxes;
}

function removeFromFading(box) {
    let i = _.indexOf(_fadingBoxes, box);
    _fadingBoxes.splice(i, 1);
}

function addToFading(box) {
    _fadingBoxes.push(box);
}

function reset() {
    _boxes = [];
    _fadingBoxes = [];
}

export default {
    create: create,
    get: get,
    reset: reset,
    getFading: getFading,
    removeFromFading: removeFromFading,
    addToFading: addToFading
};
