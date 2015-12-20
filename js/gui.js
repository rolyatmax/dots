import {GUI} from 'dat-gui';
import DOTS from './sketch';
import {settings, COLORS} from './settings';


let gui = new GUI();
gui.add(settings, 'DRAWERS_COUNT', 1, 100).step(1).onFinishChange(() => DOTS.reset());
gui.add(settings, 'BOX_SIZE', 10, 80).step(1).onFinishChange(() => DOTS.reset());
gui.add(settings, 'DRAW_SPEED', 0.05, 1).step(0.01);
gui.add(settings, 'FADE_SPEED', 0.01, 0.5).step(0.01);
gui.add(settings, 'FILL_COLORS', {
    MonoBlue: 'MONOBLUE',
    Grayscale: 'GRAYSCALE',
    Multi: 'MULTI'
}).onFinishChange(val => settings.FILL_COLORS = COLORS[val]);
gui.add(DOTS, 'reset');
