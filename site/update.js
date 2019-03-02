/***
 * Öffimonitor - display the Wiener Linien timetable for nearby bus/tram/subway
 * lines on a screen in the Metalab Hauptraum
 *
 * Copyright (C) 2015-2016   Moritz Wilhelmy
 * Copyright (C) 2015-2016   Bernhard Hayden
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
// vim: set ts=8 noet: Use tabs, not spaces!
"use strict";

var /*const*/ debug = false;

/**** table functions ****/
/* these might be prettier in OO, but I really don't care enough right now */
function make_table(head)
{
	let table = document.createElement('table');
	let thead = document.createElement('thead');
	let tbody = document.createElement('tbody');
	let tr = document.createElement('tr');

	for (let i = 0; i < head.length; i++) {
		let td = document.createElement("td");
		td.appendChild(document.createTextNode(head[i]));
		tr.appendChild(td);
	}

	thead.appendChild(tr);
	table.appendChild(thead);
	table.appendChild(tbody);
	return table;
}

function make_row(table, entry)
{
	let currentTime = new Date().getTime();
	let waitTimeString = formatTime(entry.timestamp);
	let waitMs = entry.timestamp - currentTime;
	let waitMinutes = Math.floor(waitMs / 60000);
	let waitHours = Math.floor(waitMinutes / 60);
	if (waitHours) {
		waitMinutes -= 60;
	}
	let waitSeconds = ((waitMs % 60000) / 1000).toFixed(0);

	if (waitMs < 0 || waitMs < entry.unreachTime*1000) { return false; }

	let tr = document.createElement("tr");
	let tdTime = document.createElement("td");
	if (waitMs < entry.walkTime * 1000) {
		tdTime.className = "time supersoon";
	} else if (waitMs < (entry.walkTime + 180) * 1000) {
		tdTime.className = "time soon";
	} else {
		tdTime.className = "time";
	}

	let tdTimeString = document.createElement("b");
	tdTimeString.appendChild(document.createTextNode(waitTimeString));
	tdTimeString.className="departureTime";
	tdTime.appendChild(tdTimeString);

	tdTime.appendChild(document.createTextNode("\u00A0+" + (waitHours ? waitHours + 'h' : '') + (waitMinutes < 10 ? '0' : '') + waitMinutes + "m"));
	tr.appendChild(tdTime);

	let tdLine = document.createElement("td");

	if (typeof entry.line === "object") {
		tdLine.appendChild(entry.line);
	} else {
		tdLine.appendChild(document.createTextNode(entry.line));
	}
	tr.appendChild(tdLine);

	let tdStop = document.createElement("td");
	tdStop.appendChild(document.createTextNode(entry.stop));
	tr.appendChild(tdStop);

	let tdTowards = document.createElement("td");
	if (debug)
		console.log(capitalizeFirstLetter(entry.towards));
	tdTowards.appendChild(document.createTextNode(capitalizeFirstLetter(entry.towards)));
	tr.appendChild(tdTowards);

	table.lastChild.appendChild(tr);
}

function display_table(table)
{
	let overviewElement;

	// fall back to inserting into document.body if no previous "overview"
	// element was found
	let parentElement = document.getElementById('container');

	// dispose of the previous display table (if any)
	   	if ((overviewElement = document.getElementById('overview'))) {
		parentElement = overviewElement.parentElement;
		parentElement.removeChild(overviewElement);
	}

	table.id = 'overview';
	parentElement.appendChild(table);
}
/**** end of table stuff ****/

function update_view(json)
{
	let table = make_table(["Latency", "Port", "Source", "Destination"]);
	let mon;
	if (json.data) {
		mon = json.data.monitors;
	} else {
		mon = [];
	}

	let values = [];

	//fetch filter(s)
	let params = new URLSearchParams(document.location.search.substring(1));
	let flines = params.get("flines"); //filter for transportation line(s)
	let fline_array;

	if (flines != null) {
		fline_array = flines.toUpperCase().split(",");
	}
	let fdests = params.get("fdests");
	let fdest_array;
	if (fdests != null) {
		fdest_array = fdests.toLowerCase().split(",");
	}

	// XXX This part particularly unfinished:
	// TODO sort by time
	for (let i = 0; i < mon.length; i++) {
		let lines = mon[i].lines;
		let walkTime = walkTimes[mon[i].locationStop.properties.title] ? walkTimes[mon[i].locationStop.properties.title].walkTime : 480;
		let unreachTime = walkTimes[mon[i].locationStop.properties.title] ? walkTimes[mon[i].locationStop.properties.title].unreachTime : 0;

		for (let l = 0; l < lines.length; l++) {
			let dep;
			if (mon[i].lines[l].towards !== "BETRIEBSSCHLUSS ! BENÜTZEN SIE BITTE DIE NIGHTLINE" &&
				mon[i].lines[l].name !== "VRT") {
				dep = mon[i].lines[l].departures.departure;
			} else {
				continue;
			}

			// exclude duplicated hosts (happens if you have multiple stations serve the same line)
			let exclude = false;
			for (let x = 0; x < exclusions.length; x++) {
				if ('name' in exclusions[x]) {
					// exclusion specifies different name
					if (exclusions[x].name !== mon[i].lines[l].name) {
						continue;
					}
				}

				if ('station' in exclusions[x]) {
					// exclusion specifies different station
					if (exclusions[x].station !== mon[i].locationStop.properties.title) {
						continue;
					}
				}

				if ('towards' in exclusions[x]) {
					// exclusion specifies different destination
					if (exclusions[x].towards !== mon[i].lines[l].towards) {
						continue;
					}
				}

				exclude = true;
			}

			if (fline_array != null) {
				if (!(fline_array.includes(mon[i].lines[l].name))) {
					exclude = true;
				}
			}
			if (fdest_array != null) {
				if (!(fdest_array.some(substring => mon[i].lines[l].towards.toLowerCase().includes(substring)))) {
					exclude = true;
				}
			}

			if (exclude) {
				// skip this entry
				continue;
			}

			for (let j = 0; j < dep.length; j++) {
				if (dep[j].departureTime.timeReal === undefined && dep[j].departureTime.timePlanned === undefined) {
					if (debug)
						console.log({"timestamp": dep[j].departureTime.timePlanned, "walkTime": walkTime, "unreachTime": unreachTime, "line": formatLines(lines[l].name), "stop": mon[i].locationStop.properties.title, "towards": lines[l].towards}); // FIXME: console.log doesn't seem to handle objects, if you need this, turn it into a string
				} else if (dep[j].departureTime.timeReal === undefined) {
					values[values.length] = {"timestamp": formatTimestamp(dep[j].departureTime.timePlanned), "walkTime": walkTime, "unreachTime": unreachTime, "line": formatLines(lines[l].name), "stop": mon[i].locationStop.properties.title, "towards": lines[l].towards};
				} else {
					values[values.length] = {"timestamp": formatTimestamp(dep[j].departureTime.timeReal), "walkTime": walkTime, "unreachTime": unreachTime, "line": formatLines(lines[l].name), "stop": mon[i].locationStop.properties.title, "towards": lines[l].towards};
				}
			}
		}
	}

	values.sort(function(a, b) {
		return a.timestamp - b.timestamp;
		//return parseFloat(a.timestamp + a.walkTime * 60 * 1000) - parseFloat(b.timestamp + b.walkTime * 60 * 1000);
	});

	for (let i = 0; i < values.length; i++) {
		if (debug)
			console.log(values[i]);
		make_row(table, values[i]);
	}

	display_table(table);
}

function formatTime(timestamp) {
	let date = new Date(timestamp);
	let hours = "0" + date.getHours();
	let minutes = "0" + date.getMinutes();

	let formattedTime = hours.substr(-2) + ':' + minutes.substr(-2);
	return formattedTime;
}

function capitalizeFirstLetter(str)
{
	return str.replace(/\w[^- ]*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function formatTimestamp(timestamp)
{
	let isoStamp = timestamp.split('.')[0] + '+' + timestamp.split('.')[1].split('+')[1].match(/.{2}/g)[0] + ':00';
	let depTime = new Date(isoStamp).getTime();
	return depTime;
}

function formatLines(line)
{
	if (line === "U1") {
		let img = document.createElement("img");
		img.src = "img/u1.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line === "U2") {
		let img = document.createElement("img");
		img.src = "img/u2.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line === "U3") {
		let img = document.createElement("img");
		img.src = "img/u3.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line === "U4") {
		let img = document.createElement("img");
		img.src = "img/u4.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line === "U5") {
		let img = document.createElement("img");
		img.src = "img/u5.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line === "U6") {
		let img = document.createElement("img");
		img.src = "img/u6.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line === "WLB") {
		let img = document.createElement("img");
		img.src = "img/wlb.svg";
		img.width = 40;
		img.height = 40;
		return img;
	} else if (line.indexOf("D") > -1 || line.match(/^[0-9]+$/) != null) {
		let element = document.createElement("span");
		element.className = "tram";
		element.innerHTML = line;
		return element;
	} else if (line.indexOf("A") > -1) {
		let element = document.createElement("span");
		element.className = "bus";
		element.innerHTML = line;
		return element;
	} else if (line.indexOf("N") > -1) {
		let element = document.createElement("span");
		element.className = "nightline";
		element.innerHTML = line;
		return element;
	} else {
		return line;
	}
}

function update()
{

	// Also update weather if loaded
	if (typeof weatherUpdateFunction === 'function') {
		weatherUpdateFunction();
	}

	document.getElementById("trafficError").style.display = "none";
	document.getElementById("error").style.display = "none";
	document.getElementById("container").style.opacity = "1";

	let currentTime = new Date();
	document.getElementById('currentTime').innerHTML = (currentTime.getHours() < 10 ? '0' : '') + currentTime.getHours() + ":" + (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes();
	let req = new XMLHttpRequest();
	req.open('GET', api_url);
	req.onreadystatechange = function () {

		if (req.readyState !== 4)
			return;

		// req.status == 0 in case of a local file (e.g. json file saved for testing)
		if (req.status !== 200 && req.status !== 0) {
			console.log('no connection to api (' + req.status + ')');
			return;
		}

		try {
			var json = JSON.parse(req.responseText);
			update_view(json);
		} catch (e) {
			if (e instanceof SyntaxError) // invalid json document received
				document.getElementById("trafficError").style.display = "block";
				//document.getElementById("error").style.display = "block";
				//document.getElementById("container").style.opacity = "0.2";
				console.log('api returned invalid json')/*TODO*/;
			//throw e;
		}
	};
	req.send();
}

document.addEventListener("DOMContentLoaded", updateOeffiTable);
function updateOeffiTable() {
	update();
	window.setInterval(update, 10000);
};
