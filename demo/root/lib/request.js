"use strict";
const ngx = {}

// Send POST request to ./lib/response.lua
ngx.post = async function(task, _args) {
	if (emi('loading')) { show(1, 'loading'); }
	let res;
	let args = _args || {};
	args.task = task;
	try {
		res = await fetch ('/@response', {
			method: 'POST',
			'Content-Type': 'application/x-www-form-urlencoded',
			body: JSON.stringify(args)
		})
		.then(R => R.json())
		.then(data => {
			if (args.log) { console.log('PACKET_DATA: ', data); }
			if (emi('loading')) { hide('loading'); }
			return data;
		});
	} catch (err) {
		console.log('PACKET_ERROR: ' + err);
		if (emi('loading')) { hide('loading'); }
	}
	return res;
}
