/* globals Info */

import {markdown} from 'markdown';

require('./sketch');
require('./gui');


function httpGet(url) {
    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                resolve(this.response);
            } else {
                reject(this.response);
            }
        };
        request.onerror = function() {
            reject(this.response);
        };
        request.send();
    });
}


httpGet('README.md').then(readme => {
    new Info({
        html: markdown.toHTML(readme),
        el: 'info',
        container: 'container',
        keyTrigger: true
    });
});
