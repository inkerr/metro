import * as L from 'leaflet';
import * as svg from './svg';
import * as util from './util';
import * as po from './plain-objects';

export function transferToModel(transfer: po.Transfer, elements: Element[]) {
    const cached =  [transfer.source, transfer.target];
    const props = ['source', 'target'];
    props.forEach((prop, pi) => {
        Object.defineProperty(transfer, prop, {
            get: () => transfer['_' + prop],
            set: (platformIndex: number) => {
                const circle = document.getElementById('p-' + platformIndex);
                const circleTotalRadius = Number(circle.getAttribute('r')) / 2 + parseFloat(getComputedStyle(circle).strokeWidth);
                const pos = this.platformsOnSVG[platformIndex];
                if (elements[0].tagName === 'line') {
                    const n = pi + 1;
                    const otherPos = this.platformsOnSVG[transfer[props[1 - pi]]];
                    for (let el of elements) {
                        el.setAttribute('x' + n, pos.x.toString());
                        el.setAttribute('y' + n, pos.y.toString());
                    }
                    const gradient = document.getElementById(`g-${this.graph.transfers.indexOf(transfer)}`);
                    const dir = prop === 'source' ? otherPos.subtract(pos) : pos.subtract(otherPos);
                    svg.setGradientDirection(gradient, dir);
                    const circlePortion = circleTotalRadius / pos.distanceTo(otherPos);
                    svg.setGradientOffset(gradient, circlePortion);
                } else if (elements[0].tagName === 'path') {
                    const transfers: po.Transfer[] = [];
                    const transferIndices: number[] = [];
                    for (let i = 0; i < this.graph.transfers.length; ++i) {
                        const t = this.graph.transfers[i];
                        if (t.source === transfer.source
                            || t.target === transfer.target
                            || t.source === transfer.target
                            || t.target === transfer.source
                        ) {
                            transfers.push(t);
                            transferIndices.push(i);
                            if (transfers.length === 3) break;
                        }
                    }
                    const circular = new Set<number>();
                    for (let tr of transfers) {
                        circular.add(tr.source).add(tr.target);
                    }
                    if (circular.size !== 3) {
                        const name = this.graph.platforms[transfers[0].source].name;
                        throw new Error(`circle size is ${circular.size}: ${name}`);
                    }

                    const circumpoints: L.Point[] = [];
                    circular.forEach(i => circumpoints.push(this.platformsOnSVG[i]));

                    const cCenter = util.getCircumcenter(circumpoints);
                    const outerArcs = transferIndices.map(i => document.getElementById('ot-' + i));
                    const innerArcs = transferIndices.map(i => document.getElementById('it-' + i));
                    for (let i = 0; i < 3; ++i) {
                        const tr = transfers[i],
                            outer = outerArcs[i],
                            inner = innerArcs[i],
                            pos1 = this.platformsOnSVG[tr.source],
                            pos2 = this.platformsOnSVG[tr.target];
                        svg.setCircularPath(outer, cCenter, pos1, pos2);
                        inner.setAttribute('d', outer.getAttribute('d'));
                        const gradient = document.getElementById(`g-${transferIndices[i]}`);
                        svg.setGradientDirection(gradient, pos2.subtract(pos1));
                        const circlePortion = circleTotalRadius / pos1.distanceTo(pos2);
                        svg.setGradientOffset(gradient, circlePortion);
                    }
                } else {
                    throw new Error('wrong element type for transfer');
                }
            }
        });
        transfer['_' + prop] = cached[pi];
    });
}

export function platformToModel(platform: po.Platform|number, circles: Element[]) {
    const [idx, obj] = typeof platform === 'number'
        ? [platform, this.graph.platforms[platform]]
        : [this.graph.platforms.indexOf(platform), platform];
    const cached = obj.location;
    Object.defineProperty(obj, 'location', {
        get: () => obj['_location'],
        set: (location: L.LatLng) => {
            obj['_location'] = location;
            const locForPos = this.map.getZoom() < 12
                ? this.graph.stations[obj.station].location
                : location;
            const pos = this.map.latLngToContainerPoint(locForPos).subtract(this.map.latLngToContainerPoint(this.bounds.getNorthWest()));
            for (let c of circles) {
                c.setAttribute('cx', pos.x.toString());
                c.setAttribute('cy', pos.y.toString());
            }
            this.whiskers[idx] = this.makeWhiskers(idx);
            this.platformsOnSVG[idx] = pos;
            const spansToChange = new Set<number>(obj.spans);
            for (let spanIndex of obj.spans) {
                const span = this.graph.spans[spanIndex];
                const srcN = span.source, trgN = span.target;
                const neighborIndex = idx === srcN ? trgN : srcN;
                this.whiskers[neighborIndex] = this.makeWhiskers(neighborIndex);
                this.graph.platforms[neighborIndex].spans.forEach(si => spansToChange.add(si));
            }
            spansToChange.forEach(spanIndex => {
                const span = this.graph.spans[spanIndex];
                const srcN = span.source, trgN = span.target;
                const controlPoints = [this.platformsOnSVG[srcN], this.whiskers[srcN][spanIndex], this.whiskers[trgN][spanIndex], this.platformsOnSVG[trgN]];
                svg.setBezierPath(document.getElementById(`op-${spanIndex}`), controlPoints);
                const inner = document.getElementById(`ip-${spanIndex}`);
                if (inner) svg.setBezierPath(inner, controlPoints);
            });
            this.graph.transfers
                .filter(tr => tr.source === idx || tr.target === idx)
                .forEach(tr => tr[idx === tr.source ? 'source' : 'target'] = idx);
        }
    });
    obj['_location'] = cached;
}