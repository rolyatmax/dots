import {settings} from './settings';


let _lines = {};


class Line {
    constructor(dot1, dot2) {
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
        this.boxes.forEach(box => box.lineDrawn());
    }
}


function create(dot1, dot2) {
    let line = new Line(dot1, dot2);
    _lines[dot1.id] = _lines[dot1.id] || {};
    _lines[dot1.id][dot2.id] = line;
}

// doesn't matter what order dot1 and dot2 are passed in
function get(dot1, dot2) {
    if (_lines[dot1.id] && _lines[dot1.id][dot2.id]) {
        return _lines[dot1.id][dot2.id];
    }
    return _lines[dot2.id] && _lines[dot2.id][dot1.id];
}

function reset() {
    _lines = {};
}

export default {
    create: create,
    get: get,
    reset: reset
};
