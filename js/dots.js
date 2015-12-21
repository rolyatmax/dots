import {settings} from './settings';


function get(x, y) {
    return {x, y};
}

// returns up to two neighbors (the neighbor below and to the right)
function getNeighborsOf({x, y}) {
    return [
        get(x + 1, y),
        get(x, y + 1)
    ].filter(val => !!val);
}

// returns all four neighbors
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

function getDotID({x, y}) {
    return `d-x${x}y${y}`;
}

function getDotCoords({x, y}) {
    x *= settings.BOX_SIZE;
    y *= settings.BOX_SIZE;
    return { x, y };
}

function drawDot(ctx, dot) {
    let {x, y} = getDotCoords(dot);
    ctx.fillStyle = settings.LIGHT_GRAY;
    ctx.fillRect(x, y, settings.DOT_SIZE, settings.DOT_SIZE);
}

export default {
    get,
    reset,
    getNeighborsOf,
    getAllNeighborsOf,
    getFourCorners,
    getDotID,
    getDotCoords,
    drawDot
};
