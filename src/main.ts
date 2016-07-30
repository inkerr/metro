'use strict';

import { getConfig, getContent } from './res';
import { updateDictionary, translate } from './i18n';
import MetroMap from './metromap';

L.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet/v0.7.7/images';

if (L.Browser.ie) {
    alert("Does not work in IE (yet)");
}

import polyfills from './util/polyfills';
polyfills();

const tokens = window.location.search.match(/city=(\w+)/);
const city = tokens ? tokens[1] : 'spb';

getConfig().then(config => {
    const dictPromise = updateDictionary(config.url['dictionary']);
    for (let url of Object.keys(config.url)) {
        config.url[url] = config.url[url].replace(/\{city\}/g, city);
    }
    (document.getElementById('scheme') as HTMLLinkElement).href = config.url['scheme'];
    document.title = translate(document.title);
    dictPromise.then(() => {
        document.title = translate(document.title);
        new MetroMap(config);
    });
});