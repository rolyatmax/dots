import dots from './dots';
import lines from './lines';
import _ from 'underscore';
import {settings} from './settings';
import DOTS from './sketch';


let {abs} = Math;

let _drawers = [];
let _lines = [];
let _alive = [];


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
        this.dead = false;
        this.animating = false;
        this.id = _.uniqueId();
    }

    drawToNeighbor() {
        if (this.dead) {
            return;
        }

        if (this.animator) {
            this.animator.update();
            return;
        }

        let current = this.location;
        let neighbors = dots.getAllNeighborsOf(current);
        let someLines = _.map(neighbors, function(dot) {
            if (!dot) { return false; }
            let line = lines.get(dot, current);
            if (!line) { return false; }
            if (checkLines(line)) { return false; }
            return line;
        });

        someLines = _.compact(someLines);

        if (!someLines.length) {
            this.remove();
            return;
        }

        let i = random(someLines.length) | 0;
        let line = someLines[i];

        _lines.push(line);

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
        removeFromAlive(this);
        this.dead = true;
    }
}

function create(x, y) {
    // if x and y are coords, then get the dot from the collection
    // otherwise, assume that x is a dot
    let dot = (typeof x === 'number' && typeof y === 'number') ? dots.get(x, y) : x;

    let drawer = new Drawer(dot);
    _drawers.push(drawer);
    addToAlive(drawer);

}

// check to see if the line passed in is already in the lines array
function checkLines(line) {
    if (!line || !line.id) { return false; }
    for (let i = 0, len = _lines.length; i < len; i++) {
        if (line.id === _lines[i].id) { return true; }
    }
    return false;
}

function get() {
    return _drawers;
}

function addToAlive(drawer) {
    _alive.push(drawer);
}

function removeFromAlive(drawer) {
    let i = _.indexOf(_alive, drawer);
    _alive.splice(i, 1);
}

function getAlive() {
    return _alive;
}

function reset() {
    _drawers = [];
    _lines = [];
}

export default {
    create: create,
    get: get,
    reset: reset,
    getAlive: getAlive,
    removeFromAlive: removeFromAlive,
    addToAlive: addToAlive
};
