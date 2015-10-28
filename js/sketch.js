import dots from './dots';
import Sketch from 'sketch-js';
import drawers from './drawers';
import lines from './lines';
import boxes from './boxes';
import {settings} from './settings';

let {ceil} = Math;

let DOTS = Sketch.create({
    container: document.getElementById('container'),
    autostart: false,
    autoclear: false
});

DOTS = Object.assign(DOTS, {
    setup: function() {
        let xLimit = ceil(this.width / settings.BOX_SIZE);
        let yLimit = ceil(this.height / settings.BOX_SIZE);

        for (let x = 0; x < xLimit; x++) {
            for (let y = 0; y < yLimit; y++) {
                dots.create(x, y);
            }
        }

        let allDots = dots.get();
        let leng = allDots.length;
        for (let i = 0; i < leng; i++) {
            let dot = allDots[i];
            let neighbors = dots.getNeighborsOf(dot);

            lines.create(dot, neighbors[0]);
            lines.create(dot, neighbors[1]);
        }

        for (let p = 0; p < leng; p++) {
            let ds = dots.getFourCorners(allDots[p]);
            if (ds.length !== 4) { continue; }
            boxes.create(ds);
        }

        for (let k = 0; k < settings.DRAWERS_COUNT; k++) {
            let d = random(allDots);
            drawers.create(d.x, d.y);
        }

        let q = allDots.length;
        while (q--) {
            allDots[q].draw(this);
        }

    },

    update: function() {
        if (!drawers.getAlive().length) {
            this.reset();
        }
    },

    draw: function() {
        let allDrawers = drawers.get();
        for (let i = 0, len = allDrawers.length; i < len; i++) {
            allDrawers[i].drawToNeighbor();
        }

        let fadingBoxes = boxes.getFading();
        let p = fadingBoxes.length;
        while (p--) {
            fadingBoxes[p].fill(this);
        }
    },

    resize: function() {
        this.reset();
    },

    reset: function() {
        this.stop();
        dots.reset();
        lines.reset();
        drawers.reset();
        boxes.reset();
        this.clear();
        this.setup();
        this.start();
    }
});

export default DOTS;
