!function t(e,r,n){function a(i,s){if(!r[i]){if(!e[i]){var l="function"==typeof require&&require;if(!s&&l)return l(i,!0);if(o)return o(i,!0);var u=new Error("Cannot find module '"+i+"'");throw u.code="MODULE_NOT_FOUND",u}var c=r[i]={exports:{}};e[i][0].call(c.exports,function(t){var r=e[i][1][t];return a(r?r:t)},c,c.exports,t,e,r,n)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)a(n[i]);return a}({1:[function(t,e,r){"use strict";var n=t("./metro-map"),a=function(){return new L.TileLayer("https://{s}.tiles.mapbox.com/v3/inker.km1inchd/{z}/{x}/{y}.png",{minZoom:9,id:"inker.km1inchd",reuseTiles:!0,bounds:null,attribution:'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>'})}(),o=function(){return new L.TileLayer("http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}",{minZoom:9,reuseTiles:!0,attribution:'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'})}(),i=new n("map-container",function(t){return 15>t?a:o});i.getGraphAndFillMap()},{"./metro-map":2}],2:[function(t,e,r){"use strict";var n=window.L,a=t("./svg"),o=t("./util"),i=function(){function t(t,e){var r=11;this.tileLayersForZoom=e,this._tileLayer=e(11),this.map=new n.Map(t,{inertia:!1}).addLayer(this._tileLayer).setView(new n.LatLng(60,30),r).addControl(new n.Control.Scale({imperial:!1})),console.log("map should be created by now"),this.overlay=document.getElementById("overlay"),this.overlay.id="overlay",this.overlay.style.fill="white",this.overlay.style.zIndex="10",this.addListeners()}return t.prototype.addListeners=function(){var t=this,e=this.map.getPanes().mapPane,r=void 0;this.map.on("movestart",function(e){return t.map.touchZoom.disable()}),this.map.on("move",function(r){return t.overlay.style.transform=e.style.transform}),this.map.on("moveend",function(e){t.exTranslate=o.parseTransform(t.overlay.style.transform),t.map.touchZoom.enable()}),this.map.on("zoomstart",function(e){t.map.dragging.disable(),r=t.map.getZoom(),t.overlay.style.opacity="0.5"}),this.map.on("zoomend",function(e){var n=t.tileLayersForZoom(t.map.getZoom());t.tileLayersForZoom(r)!=n&&(t.tileLayer=n),t.redrawNetwork(),t.overlay.style.opacity=null,t.map.dragging.enable()})},t.prototype.refillSVG=function(){for(var t=this,e=void 0;e=this.overlay.firstChild;)this.overlay.removeChild(e);["paths","transfers","station-circles","dummy-circles"].forEach(function(e){var r=a.createSVGElement("g");r.id=e,t.overlay.appendChild(r)});var r=document.getElementById("transfers");r.classList.add("transfer")},t.prototype.getGraphAndFillMap=function(){var t=this,e=new XMLHttpRequest;e.onreadystatechange=function(){if(4===e.readyState){if(200!==e.status)return console.error("couldn't fetch the graph:\n"+e.status+": "+e.statusText);t.graph=JSON.parse(e.responseText),t.extendBounds(),t.map.setView(t.bounds.getCenter()),t.map.once("moveend",function(e){return t.redrawNetwork()})}},e.open("GET","json/graph.json",!0),e.setRequestHeader("X-Requested-With","XMLHttpRequest"),e.send()},t.prototype.extendBounds=function(){var t=this,e=this.graph.platforms[0].location;this.bounds=new n.LatLngBounds(e,e),this.graph.platforms.forEach(function(e){return t.bounds.extend(e.location)})},Object.defineProperty(t.prototype,"tileLayer",{get:function(){return this._tileLayer},set:function(t){var e=this;this.map.addLayer(t);var r=this._tileLayer;t.once("load",function(){return e.map.removeLayer(r)}),this._tileLayer=t},enumerable:!0,configurable:!0}),t.prototype.showPlate=function(t){var e=t.target,r=e.dataset,n=document.getElementById(r.platformId||r.stationId),o=a.makePlate(n),i=e.parentNode,s=i.parentNode;e.onmouseout=function(t){return s.removeChild(o)},s.insertBefore(o,i)},t.prototype.posOnSVG=function(t,e){var r=this.map.latLngToContainerPoint(e);return r.subtract(t.min)},t.prototype.redrawNetwork=function(){var t=this,e=this;this.refillSVG(),console.log(o.getUserLanguage()),console.log(this.graph.platforms.length);var r=this.map.getZoom(),i=this.bounds.getNorthWest(),s=this.bounds.getSouthEast(),l=new n.Bounds(this.map.latLngToContainerPoint(i),this.map.latLngToContainerPoint(s));console.log("bounds: "+l.min),console.log(this.overlay.style.transform);var u=o.parseTransform(this.overlay.style.transform);this.overlay.style.left=(l.min.x-u.x).toString()+"px",this.overlay.style.top=(l.min.y-u.y).toString()+"px";var c=l.getSize();this.overlay.style.width=c.x+"px",this.overlay.style.height=c.y+"px";var p=new Array(this.graph.platforms.length),d=document.createDocumentFragment(),m=document.getElementById("station-circles"),h=document.getElementById("dummy-circles"),g=document.getElementById("transfers");10>r||(12>r?!function(){{var n=.5*(r-7),o=1.25*n,i=.4*o;document.getElementById("transfers")}t.graph.stations.forEach(function(t,r){var n=e.map.latLngToContainerPoint(t.location),s=n.subtract(l.min),u=a.makeCircle(s,o);a.convertToStation(u,"s-"+r,t,i),m.appendChild(u);var c=a.makeCircle(s,2*o);c.classList.add("invisible-circle"),c.dataset.stationId=u.id,h.appendChild(c),c.onmouseover=e.showPlate})}():!function(){var i=.5*(r-7),s=.4*i,u=new Set,c=document.getElementById("transfers");t.graph.stations.forEach(function(t,r){var n=o.findCircle(e.graph,t),g=[];if(t.platforms.forEach(function(t){var o=e.graph.platforms[t],c=e.posOnSVG(l,o.location),m=a.makeCircle(c,i);a.convertToStation(m,"p-"+t.toString(),o,s),m.dataset.station=r.toString();var f=a.makeCircle(c,2*i);f.classList.add("invisible-circle"),f.dataset.platformId=m.id,d.appendChild(m),h.appendChild(f),f.onmouseover=e.showPlate,2===o.spans.length&&!function(){for(var r=[c,c],n=[0,0],a=0;2>a;++a){var i=e.graph.spans[o.spans[a]],s=i.source===t?i.target:i.source,u=e.graph.platforms[s],d=e.posOnSVG(l,u.location);n[a]=c.distanceTo(d),r[a]=c.add(d).divideBy(2)}var m=r[1].subtract(r[0]).multiplyBy(n[0]/(n[0]+n[1])),h=r[0].add(m),g=c.subtract(h);p[t]=r.map(function(t){return t.add(g)})}(),n&&n.indexOf(o)>-1&&(g.push(c),u.add(t))}),n){var f=o.getCircumcenter(g),y=f.distanceTo(g[0]),v=a.makeCircle(f,y);v.classList.add("transfer"),v.style.strokeWidth=s.toString(),v.style.opacity="0.5",c.appendChild(v)}m.appendChild(d)});for(var f=0;f<t.graph.spans.length;++f){var y=t.graph.spans[f],v=t.graph.platforms[y.source],b=t.graph.platforms[y.target],x=v,S=b;if(2===v.spans.length){var w=f==v.spans[0]?v.spans[1]:v.spans[0],L=t.graph.spans[w],C=L.source==y.source?L.target:L.source;x=t.graph.platforms[C]}if(2===b.spans.length){var w=f==b.spans[0]?b.spans[1]:b.spans[0],L=t.graph.spans[w],E=L.source==y.target?L.target:L.source;S=t.graph.platforms[E]}{[x,v,b,S].map(function(t){return e.map.latLngToContainerPoint(t.location)}).map(function(t){return new n.Point(t.x-l.min.x,t.y-l.min.y)})}}t.graph.transfers.forEach(function(t){if(!u.has(t.source)||!u.has(t.target)){var r=e.graph.platforms[t.source],n=e.graph.platforms[t.target],o=e.posOnSVG(l,r.location),i=e.posOnSVG(l,n.location),c=a.createSVGElement("line");c.setAttribute("x1",o.x.toString()),c.setAttribute("y1",o.y.toString()),c.setAttribute("x2",i.x.toString()),c.setAttribute("y2",i.y.toString()),c.classList.add("transfer"),c.style.strokeWidth=s.toString(),c.style.opacity="0.5",g.appendChild(c)}})}())},t}();e.exports=i},{"./svg":3,"./util":4}],3:[function(t,e,r){"use strict";function n(t,e){var r=i("circle");return r.setAttribute("r",e.toString()),r.setAttribute("cy",t.y.toString()),r.setAttribute("cx",t.x.toString()),r}function a(t,e,r,n){t.id=e,t.classList.add("station-circle"),t.style.strokeWidth=n.toString(),t.dataset.lat=r.location.lat.toString(),t.dataset.lng=r.location.lng.toString(),t.dataset.ru=r.name,t.dataset.fi=r.altName}function o(t){if(4!==t.length)throw new Error("there should be 4 points");var e=i("path"),r=t.reduce(function(t,e,r){return""+t+(1===r?"C":" ")+e.x+","+e.y},"M");return e.setAttribute("d",r),e}function i(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function s(t){var e=u.createSVGElement("g"),r=u.createSVGElement("line"),n=new l.Point(Number(t.getAttribute("cx")),Number(t.getAttribute("cy"))),a=(Number(t.getAttribute("r")),new l.Point(4,8)),o=new l.Bounds(n,n.subtract(a));r.setAttribute("x1",o.min.x.toString()),r.setAttribute("y1",o.min.y.toString()),r.setAttribute("x2",o.max.x.toString()),r.setAttribute("y2",o.max.y.toString()),r.classList.add("plate-pole");var i=t.dataset.ru,s=t.dataset.fi,p=s?Math.max(i.length,s.length):i.length,d=u.createSVGElement("rect"),m=12,h=new l.Point(10+6*p,s?18+m:18);d.setAttribute("width",h.x.toString()),d.setAttribute("height",h.y.toString());var g=o.min.subtract(h);d.setAttribute("x",g.x.toString()),d.setAttribute("y",g.y.toString()),d.classList.add("plate-box");var f=u.createSVGElement("text"),y=u.createSVGElement("tspan"),v=n.subtract(new l.Point(3,h.y-12)).subtract(o.getSize());y.setAttribute("x",v.x.toString()),y.setAttribute("y",v.y.toString());var b=y.cloneNode();return b.setAttribute("y",(v.y+m).toString()),"fi"===c.getUserLanguage()?(y.textContent=s,b.textContent=i):(y.textContent=i,b.textContent=s),f.setAttribute("fill","black"),f.appendChild(y),f.appendChild(b),f.classList.add("plate-text"),e.appendChild(d),e.appendChild(r),e.appendChild(f),e.id="plate",e}var l=window.L,u=t("./svg"),c=t("./util");r.makeCircle=n,r.convertToStation=a,r.makeCubicBezier=o,r.createSVGElement=i,r.makePlate=s},{"./svg":3,"./util":4}],4:[function(t,e,r){"use strict";function n(){var t=(navigator.userLanguage||navigator.language).substr(0,2).toLowerCase();return["ru","fi"].indexOf(t)>-1?t:"en"}function a(t){var e=t.match(/translate3d\((-?\d+)px,\s?(-?\d+)px,\s?(-?\d+)px\)/i);return e?new s.Point(Number(e[1]),Number(e[2])):new s.Point(0,0)}function o(t,e){var r=[];return e.platforms.forEach(function(e){return r.push(t.platforms[e])}),3===r.length&&r.every(function(t){return 2===t.transfers.length})?r:null}function i(t){if(3!==t.length)throw new Error("must have 3 vertices");console.log(t[1]);var e=t[1].subtract(t[0]),r=t[2].subtract(t[0]),n=e.x*e.x+e.y*e.y,a=r.x*r.x+r.y*r.y;return new s.Point(r.y*n-e.y*a,e.x*a-r.x*n).divideBy(2*(e.x*r.y-e.y*r.x)).add(t[0])}var s=window.L;r.getUserLanguage=n,r.parseTransform=a,r.findCircle=o,r.getCircumcenter=i},{}]},{},[1]);