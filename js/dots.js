import {settings} from './settings';


let _dots = {};
let _dotsArray = [];

class Dot {
    constructor(x, y) {
        Object.assign(this, { x, y, id: `d-x${x}y${y}` });
    }

    draw(ctx) {
        let {x, y} = this.coords();
        ctx.fillStyle = settings.LIGHT_GRAY;
        ctx.fillRect(x, y, settings.DOT_SIZE, settings.DOT_SIZE);
        return this;
    }

    coords() {
        let x = this.x * settings.BOX_SIZE;
        let y = this.y * settings.BOX_SIZE;
        return { x, y };
    }
}

function create(x, y) {
    add(new Dot(x, y));
}

function add(dot) {
    if (!dot) { return; }
    if (typeof dot.x !== 'number' || typeof dot.y !== 'number') { return; }

    let x = `x${dot.x}`;
    let y = `y${dot.y}`;

    _dots[x] = _dots[x] || {};
    _dots[x][y] = dot;

    _dotsArray.push(dot);
}

function get(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        return _dotsArray;
    }

    x = `x${x}`;
    y = `y${y}`;

    return _dots[x] && _dots[x][y];
}

// returns up to two neighbors (the neighbor below and to the right)
function getNeighborsOf({x, y}) {
    return [
        get(x + 1, y),
        get(x, y + 1)
    ].filter(val => !!val);
}

// returns all four neighbors)
// TODO: memoize me
function getAllNeighborsOf({x, y}) {
    return [
        get(x + 1, y),
        get(x, y + 1),
        get(x - 1, y),
        get(x, y - 1)
    ].filter(val => !!val);
}

// with 'dot' as the upper LH corner, get the next 3 dots that make up the box
// TODO: memoize me
function getFourCorners(dot) {
    return [
        dot,
        get(dot.x + 1, dot.y),
        get(dot.x + 1, dot.y + 1),
        get(dot.x, dot.y + 1)
    ].filter(val => !!val);
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
