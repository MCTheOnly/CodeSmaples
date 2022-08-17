// ######
// SAMPLE 1 - requestAnimationFrame API, requestVideoFrameCallback API, gamepad API
// EXPERIMENTAL requesttVideoFrameCallback REQUIRED USE OF 'ANY' TYPE
// ######

import './style.scss'
import * as v from './variables'
import * as f from './functions/functions'
import { controllerObj } from './classes/analogObj'
import { csvObj } from './classes/csvObj'
import { setCookie } from './cookies/cookie'
import { getCookie } from './cookies/cookie'

let i: number
let j: number

var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers: { [key: number | string]: Gamepad } = {};
var rAF = window.requestAnimationFrame;

const analog = new controllerObj(
	{ pos: { y: 0, x: 0 }, conf: { y: { axis: -1, multiplier: 1 }, x: { axis: -1, multiplier: 1 } } },
	{ pos: { y: 0, x: 0 }, conf: { y: { axis: -1, multiplier: 1 }, x: { axis: -1, multiplier: 1 } } },
	{ y: 0, x: 0 }, { y: 0, x: 0 },
	{ y: 0, x: 0 }, { y: 0, x: 0 },
	{ y: 1, x: 1 }, { y: 1, x: 1 },
	{ y: 0, x: 0 }, { y: 0, x: 0 },
	false, true
)

const csv = new csvObj(
	{ pos: { y: 0, x: 0 }, conf: { y: { axis: -1, multiplier: 1 }, x: { axis: -1, multiplier: 1 } } },
	{ pos: { y: 0, x: 0 }, conf: { y: { axis: -1, multiplier: 1 }, x: { axis: -1, multiplier: 1 } } },
	{ y: 0, x: 0 }, { y: 0, x: 0 },
	{ y: 0, x: 0 }, { y: 0, x: 0 },
	{ y: 1, x: 1 }, { y: 1, x: 1 },
	[], false, 0, 1
)
csv.updateSpeed()

const xhttp = new XMLHttpRequest

xhttp.open("GET", "csv.csv");
xhttp.send();

let clock;
csv.updateOffset()

xhttp.onload = function () {
	let response = this.responseText;

	csv.data = f.CSVToArray(response, ',')

	v.video.requestVideoFrameCallback(frameCallback);
}

const frameCallback = (now: any, metadata: any) => {

	if (csv.loop) {
		csv.setPos(metadata)
		csv.motion(v.csvLeft, v.csvRight);
	}
	v.video.requestVideoFrameCallback(frameCallback);
};

function connecthandler(e: GamepadEvent) {
	addgamepad(e.gamepad);
}

function disconnecthandler(e: GamepadEvent) {
	removegamepad(e.gamepad);
	console.log('Gamepad Disconnected');
}

function removegamepad(gamepad: Gamepad) {
	delete controllers[gamepad.index];
}

function addgamepad(gamepad: Gamepad) {
	controllers[gamepad.index] = gamepad;
	init(gamepad);
}

function init(gamepad: Gamepad) {
	rAF(updateStatus);
}

// ######
// SAMPLE 2 - INTERFACES
// ######

export interface configuration {
	axis: number
	multiplier: 1 | -1
}

// ######

import { coordinates } from './coordinates'
import { configuration } from './configuration'

export interface movement {
	left: {
		pos: coordinates,
		conf: {
			y: configuration
			x: configuration
		}
	},
	right: {
		pos: coordinates,
		conf: {
			y: configuration
			x: configuration
		}
	},
	previousLeft: coordinates
	previousRight: coordinates
}


