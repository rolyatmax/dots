import dots from './dots';
import Sketch from 'sketch-js';
import drawers from './drawers';
import lines from './lines';
import boxes from './boxes';
import {settings} from './settings';

let {ceil} = Math;

export default Sketch.create({
    container: document.getElementById('container'),
    autostart: false,
    autoclear: false,

    setup() {
        let xLimit = ceil(this.width / settings.BOX_SIZE);
        let yLimit = ceil(this.height / settings.BOX_SIZE);

        // create all the dots
        for (let x = 0; x < xLimit; x++) {
            for (let y = 0; y < yLimit; y++) {
                dots.create(x, y);
            }
        }

        let allDots = dots.get();

        // create all the lines
        allDots.forEach(dot => {
            dots.getNeighborsOf(dot).forEach(neighbor => lines.create(dot, neighbor));
        });

        // create all the boxes
        allDots.forEach(dot => {
            let ds = dots.getFourCorners(dot);
            if (ds.length !== 4) { return; }
            boxes.create(ds);
        });

        // create all the drawers
        for (let k = 0; k < settings.DRAWERS_COUNT; k++) {
            let {x, y} = random(allDots);
            drawers.create(x, y);
        }

        // draw all the dots
        allDots.forEach(dot => dot.draw(this));
    },

    draw() {
        drawers.get().forEach(drawer => drawer.drawToNeighbor());
        boxes.getFading().forEach(box => box.fill(this));
    },

    resize() {
        this.reset();
    },

    reset() {
        this.stop();
        // FIXME: move state to one spot so we don't have to try to reset
        // state that's spread all over
        dots.reset();
        lines.reset();
        drawers.reset();
        boxes.reset();
        this.clear();
        this.setup();
        this.start();
    }
});
