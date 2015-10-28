import {uniqueId} from 'underscore';
import {settings} from './settings';


let _lines = {};
let _linesArray = [];

class Line {
    constructor(dot1, dot2) {
        this.id = uniqueId('l');
        this.dot1 = dot1;
        this.dot2 = dot2;
        this.boxes = [];
        this.drawn = false;
    }

    draw(ctx) {
        let coords1 = this.dot1.coords();
        let coords2 = this.dot2.coords();

        ctx.strokeStyle = settings.LINE_COLOR;
        ctx.beginPath();
        ctx.moveTo(coords1.x, coords1.y);
        ctx.lineTo(coords2.x, coords2.y);
        ctx.stroke();

        this.drawn = true;
    }

    setPointerToBox(box) {
        this.boxes.push(box);
    }

    alertBoxes() {
        let len = this.boxes.length;
        while (len--) {
            this.boxes[len].lineDrawn();
        }
    }
}

function add(line) {
    let dot1 = line.dot1;
    let dot2 = line.dot2;

    if (!dot1 || !dot2) { return; }
    _lines[dot1.id] = _lines[dot1.id] || {};
    _lines[dot1.id][dot2.id] = line;
    _linesArray.push(line);
}

function create(dot1, dot2) {
    add(new Line(dot1, dot2));
}

// doesn't matter what order dot1 and dot2 are passed in
function get(dot1, dot2) {
    if (!dot1 || !dot2) {
        return _linesArray;
    }

    if (_lines[dot1.id] && _lines[dot1.id][dot2.id]) {
        return _lines[dot1.id][dot2.id];
    } else {
        return _lines[dot2.id] && _lines[dot2.id][dot1.id];
    }
}

function reset() {
    _lines = {};
    _linesArray = [];
}

export default {
    create: create,
    get: get,
    reset: reset
};
