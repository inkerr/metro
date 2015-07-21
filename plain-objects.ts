/// <reference path="./typings/tsd.d.ts" />
import L = require('leaflet');

declare module Plain {
    type Platform = {
        name: string;
        altName: string;
        oldName: string;
        station: number;
        location: L.LatLng;
        elevation: number;
        spans: number[]; 
        transfers: number[];
    };

    type Station = {
        name: string;
        altName: string;
        oldName: string;
        location: L.LatLng;
        platforms: number[];
    };

    type Transfer = {
        source: number;
        target: number;
    };

    type Span = {
        source: number;
        target: number;
        routes: number[];
    };

    type Route = {
        line: string;
        branch: string;
    };

    type StationOrPlatform = {
        location: L.LatLng;
        name: string;
        altName: string;
    };

    type Graph = {
        platforms: Plain.Platform[];
        stations: Plain.Station[];
        lines: {};
        transfers: Plain.Transfer[];
        spans: Plain.Span[];
        routes: Plain.Route[];
        hints?: any;
    };
    
    type Hints = {
        crossPlatform: any;
        englishNames: any;
        elevationSegments: any;
    }
}

//export default Plain;
export = Plain;