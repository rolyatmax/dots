import {settings} from './settings';

let {LIGHT_GRAY, DOT_SIZE, BOX_SIZE} = settings;

let _dots = {};
let _dotsArray = [];

class Dot {
    constructor(x, y) {
        this.id = 'd-x' + x + 'y' + y;
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        let coords = this.coords();
        ctx.fillStyle = LIGHT_GRAY;
        ctx.fillRect(coords.x, coords.y, DOT_SIZE, DOT_SIZE);
        return this;
    }

    coords() {
        return {
            x: this.x * BOX_SIZE,
            y: this.y * BOX_SIZE
        };
    }
}

function create(x, y) {
    add(new Dot(x, y));
}

function add(dot) {
    if (!dot) { return; }
    if (typeof dot.x !== 'number' || typeof dot.y !== 'number') { return; }

    let x = 'x' + dot.x;
    let y = 'y' + dot.y;

    _dots[x] = _dots[x] || {};
    _dots[x][y] = dot;

    _dotsArray.push(dot);
}

function get(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        return _dotsArray;
    }

    x = 'x' + x;
    y = 'y' + y;

    return _dots[x] && _dots[x][y];
}

// returns two neighbors (the neighbor below and to the right)
function getNeighborsOf(dot) {
    let neighbors = [];
    neighbors.push(get(dot.x + 1, dot.y));
    neighbors.push(get(dot.x, dot.y + 1));
    return neighbors;
}

// returns all four neighbors)
function getAllNeighborsOf(dot) {
    if (dot.neighbors) { return dot.neighbors; }

    let neighbors = [];
    neighbors.push(get(dot.x + 1, dot.y));
    neighbors.push(get(dot.x, dot.y + 1));
    neighbors.push(get(dot.x - 1, dot.y));
    neighbors.push(get(dot.x, dot.y - 1));

    dot.neighbors = neighbors;
    return neighbors;
}

// with 'dot' as the upper LH corner, get the next 3 dots that make up the box
function getFourCorners(dot) {
    if (dot.corners) { return dot.corners; }

    let corners = [
        dot,
        get(dot.x + 1, dot.y),
        get(dot.x + 1, dot.y + 1),
        get(dot.x, dot.y + 1)
    ];
    dot.corners = corners.filter(val => val);
    return dot.corners;
}

function reset() {
    _dots = {};
    _dotsArray = [];
}

export default {
    get: get,
    getNeighborsOf: getNeighborsOf,
    getAllNeighborsOf: getAllNeighborsOf,
    getFourCorners: getFourCorners,
    reset: reset,
    create: create
};
