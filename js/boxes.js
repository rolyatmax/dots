import lines from './lines';
import {settings} from './settings';


let _fadingBoxes = [];


class Color {
    constructor(opts = {}) {
        let {r, g, b, a, box} = opts;
        Object.assign(this, { r, g, b, a, box, curAlpha: 0 });
    }

    toRGBA() {
        let {r, g, b, curAlpha} = this;
        let rgba = [r, g, b, curAlpha].join(',');
        return `rgba(${rgba})`;
    }

    fadeInStep() {
        let da = (this.a - this.curAlpha) * settings.FADE_SPEED;
        this.curAlpha += da;
        if (da < 0.00001) {
            this.curAlpha = this.a;
            // FIXME: bad idea to have this calling the box's method
            if (this.box) { this.box.fadeComplete(); }
        }
        return this;
    }
}


class Box {
    constructor(dot1, dot2, dot3, dot4) {
        this.dots = [dot1, dot2, dot3, dot4];
        this.lines = [
            lines.get(dot1, dot2),
            lines.get(dot2, dot3),
            lines.get(dot3, dot4),
            lines.get(dot4, dot1)
        ];
        // FIXME: pointing back to box seems like a bad idea
        this.lines.forEach(line => line.setPointerToBox(this));
    }

    // returns the upper LH dot of the box
    // TODO: memoize this
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
        let dot = this.getOriginDot();
        let {x, y} = dot.coords();
        let offset = settings.FILLED_BOX_OFFSET;
        let dimen = settings.BOX_SIZE - (offset * 2);
        ctx.beginPath();
        ctx.rect(x + offset, y + offset, dimen, dimen);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.rect(x, y, settings.BOX_SIZE, settings.BOX_SIZE);
        ctx.fillStyle = this.color.fadeInStep().toRGBA();
        ctx.fill();
    }

    // FIXME: I don't like the way this method is called by other modules
    lineDrawn() {
        if (this.checkDrawnLines()) {
            this.startFade();
        }
    }

    startFade() {
        this.color = new Color({
            ...random(settings.FILL_COLORS),
            box: this
        });
        _fadingBoxes.push(this);
    }

    fadeComplete() {
        let i = _fadingBoxes.indexOf(this);
        _fadingBoxes.splice(i, 1);
    }
}


function create([dot1, dot2, dot3, dot4]) {
    new Box(dot1, dot2, dot3, dot4);
}

function getFading() {
    return _fadingBoxes;
}

function reset() {
    _fadingBoxes = [];
}

export default {
    create: create,
    reset: reset,
    getFading: getFading
};
