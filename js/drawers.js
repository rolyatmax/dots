import dots from './dots';
import lines from './lines';
import {settings} from './settings';
import DOTS from './sketch';


let {abs} = Math;

let _drawers = [];
let _drawnLines = [];


class Animator {
    constructor(dot1, dot2, line, drawer) {
        this.drawer = drawer;
        this.line = line;
        this.destDot = dot2;
        this.next = dot1.coords();
        this.coords2 = dot2.coords();
        this.cur = {};
        this.complete = false;
    }

    update() {
        if (this.complete) { return; }

        this.cur = {
            x: this.next.x,
            y: this.next.y
        };

        let dx = (this.coords2.x - this.cur.x) * settings.DRAW_SPEED;
        let dy = (this.coords2.y - this.cur.y) * settings.DRAW_SPEED;

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
    }

    draw(ctx) {
        ctx.strokeStyle = settings.LINE_COLOR;
        ctx.beginPath();
        ctx.moveTo(this.cur.x, this.cur.y);
        ctx.lineTo(this.next.x, this.next.y);
        ctx.stroke();
    }
}


class Drawer {
    constructor(startingDot) {
        this.location = startingDot;
        this.animating = false;
    }

    drawToNeighbor() {
        if (this.animator) {
            this.animator.update();
            return;
        }

        let undrawnLines = dots.getAllNeighborsOf(this.location).map((dot) => {
            let line = lines.get(dot, this.location);
            return _drawnLines.includes(line) ? null : line;
        }).filter(val => !!val);

        if (!undrawnLines.length) {
            this.remove();
            return;
        }

        let i = random(undrawnLines.length) | 0;
        let line = undrawnLines[i];

        _drawnLines.push(line);

        let destDot = (line.dot1 === this.location) ? line.dot2 : line.dot1;
        this.animator = new Animator(this.location, destDot, line, this);
    }

    completedAnimation() {
        this.location = this.animator.destDot;
        this.animator.line.drawn = true;
        this.animator.line.alertBoxes();
        this.animator = null;
    }

    remove() {
        let i = _drawers.indexOf(this);
        _drawers = [
            ..._drawers.slice(0, i),
            ..._drawers.slice(i + 1)
        ];
    }
}

function create(x, y) {
    let drawer = new Drawer(dots.get(x, y));
    _drawers.push(drawer);
}

function get() {
    return _drawers;
}

function reset() {
    _drawers = [];
    _drawnLines = [];
}

export default {
    create: create,
    get: get,
    reset: reset
};
