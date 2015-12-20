/* globals Info */
import 'babel-polyfill';
import readme from '../README.md';
import './sketch';
import './gui';


new Info({
    html: readme,
    el: 'info',
    container: 'container',
    keyTrigger: true
});
