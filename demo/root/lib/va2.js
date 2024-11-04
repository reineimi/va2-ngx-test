// Note: Function args with underscore at the
// beginning are optional, ex: func(a, _b)
"use strict";
const va2 = {
	// Current version of the library, including CSS and other scripts
	// Example: 0x01020034 == 1.2.34 (major.minor.fixes)
	// Major = Full project reworks;
	// Minor = New/changed/renamed functions, styles and/or other stuff
	// Fixes = Small fixes and changes, update not needed but recommended
	ver: 0x01040083,
	verBytes: { major: 0x01000000, minor: 0x010000 },

	// Global script/application environment
	env: { init: [] },
	// Modules
	mod: {},
	// Storage for enums
	e: {},
	// Storage for "magic numbers"
	n: {
		loglvl: ['STDOUT', 'INFO', 'WARN', 'ERROR', 'CRASH'],
		display: ['block', 'flex', 'grid']
	},

	// Cursor: mouse/touch
	cur: {
		x: 0, y: 0,
		holding: 0,
		type: 'mouse',
		event: 'up',
		up: {x: 0, y: 0},
		down: {x: 0, y: 0},
		move: {x: 0, y: 0}
	},

	// Keyboard
	key: {
		name: '',
		id: 0,
		held: 0,
		event: 'up'
	},

	// Storage for temporary data
	temp: {
		history: [],
		clock: { global: 0 },
		extern: {},
		intervals: {},
		timeouts: {},
		fullscreen: 0,
		sort: {},
		inspect: {},
		slide: {},
		toggle: {},
		caret: {},
		em_root: {},
		enter: {}
	}
};


	// ENVIRONMENT

// A batch of Promises
async function promises(...awaitable) {
	await Promise.all(awaitable).then((data)=>{
		return data;
	});
}

// Initiate the script
function init() {
	loop(va2.env.init, (_,f)=>{ f(); });
}

// Load external JS/CSS/File
// Note 1: Working dir path is: './' or ''
// Note 2: JS/CSS returns style element, File returns file data
const extern = {
	js: async function(data_or_path_or_url, _id) {
		const str = data_or_path_or_url;
		const id = _id || '(generic)';
		const em = document.createElement('script');
		let UID;
		em.async = true;

		//--> URL/PATH
		if (str.match(/https:/g) || str.match(/[.]js[o]?[n]?$/g)) {
			UID = 'ext.JS:' + id;
			em.src = str;
			log(1, 'extern.js:loaded :: '+UID);
		}
		else { //--> DATA
			UID = 'ext.JS:' + id;
			em.innerHTML = `"use strict"; try{ ${str} } catch(err) { log(3, err); }`;
		}

		if (emi(UID)) { rm(UID); }
		em.id = UID;
		document.body.append(em);
		return em;
	},
	css: function (data_or_path_or_url, _id) {
		const str = data_or_path_or_url;
		const id = _id || '(generic)';
		const root = document.body;
		let UID, em;

		if (str.match(/^https:/g) || str.match(/^(.*?)\.css$/g)) { //--> URL/PATH
			UID = 'ext.CSS:' + id;
			em  = document.createElement('link');
			em.rel = 'stylesheet';
			em.href = str;
		}
		else { //--> DATA
			UID = 'ext.CSS:' + id;
			em = document.createElement('style');
			em.innerHTML = str;
		}

		if (emi(UID)) { rm(UID); }
		em.id = UID;
		root.appendChild(em);
		log(1, 'extern.css:loaded :: '+UID);
		return em;
	},
	file: async function(path_or_url_or_emiToReplace, _callback_func, _is_json) {
		let targ = path_or_url_or_emiToReplace;
		let filedata;

		if (emi(targ)) { // Upload to element
			const fr = new FileReader();
			const inp = create('input', {type: 'file'});
			inp.style.display = 'none';
			inp.click();
			inp.onchange = async ()=>{
				let fdata = fr.result;
				fr.onload = ()=>{
					let r = fr.result;
					emi(targ).innerHTML = r;
					va2.temp.extern.file = r;
					if (_callback_func) { _callback_func(r); }
				}
				await fr.readAsText(inp.files[0]);
			};
			rm(inp); return 1;
		}

		try {
			await fetch(targ)
			.then((r_file)=>{
				let f;
				if (_is_json) {
					f = r_file.json();
				} else {
					f = r_file.text();
				}
				return f;
			}).then((data)=>{
				filedata = data;
			});
		} catch {
			log(3, 'extern.file :: URL response failure');
			return 0;
		}
		return filedata;
	}
}

// Make and download a file
function mkfile(filename, str_or_obj_or_blob) {
	const rel = document.createElement('a');
	let blob = str_or_obj_or_blob;

	if (typeof blob === 'string') {
		blob = new Blob([blob], {type: 'text/plain'});
	}
	else if ((typeof blob === 'object') && !(blob instanceof Blob)) {
		let json_str = JSON.stringify(blob);
		blob = new Blob([json_str], {type: 'application/json'});
	}

	let url = URL.createObjectURL(blob);
	rel.href = url;
	rel.download = filename;
	document.body.appendChild(rel);
	rel.click();  rel.remove();
	URL.revokeObjectURL(url);
}

// Precise typeof call
function type(item) {
	if (item === 0) { return 'number'; }
	if (item !== null) {
		if (typeof item === 'object') {
			if (Array.isArray(item)) {
				return 'array';
			}
			return 'object';
		}
		return (typeof item);
	} else {
		return 'null';
	}
}

// Stringify anything
function tostring(any) {
	if (typeof any === 'undefined') {
		return 'undefined';
	} else if (any === null) {
		return 'null';
	} else {
		try {
			return any.toString();
		} catch {
			return 'unknown_type';
		}
	}
}

// Toggle the state of anything (0 or 1)
function toggle(id, _func) {
	if (va2.temp.toggle[id]) {
		va2.temp.toggle[id] = 0;
	} else {
		va2.temp.toggle[id] = 1;
	}
	if (_func) {
		_func(va2.temp.toggle[id]);
	}
}

// Get file name from PATH
function getfname(path, _withExt) {
	if (_withExt) {
		return path.match(/[^/]*$/gm)[0]
	} else {
		return path.replace(/\.[^.]*$/gm, '').match(/[^/]*$/gm)[0];
	}
}

// Sub a string or number
function cut(val, start, _plus) {
	let end = _plus || val.length;
	let it = val.toString().substring(start, end);
	if (typeof val === 'number') {
		return Number(it);
	}
	return it;
}

// Get length of anything
function len(item) {
	if (typeof item === 'number') {
		return item.toString().length;
	} else if (typeof item === 'string') {
		return item.length;
	} else if (typeof item === 'object') {
		if (Array.isArray(item)) {
			return item.length;
		}
		// Compatibility variant
		const _items = [];
		for (const [i,v] of Object.entries(item)) {
			_items.push(i);
		}
		return _items.length;
	}
}

// Regular expr. from string(s)
function regex(...strings) {
	let reg = strings.join('');
	return new RegExp(reg, 'gm');
}

// Merge two identical variables (overwrite first)
function merge(a, b) {
	try {
		if (typeof a === 'string') {
			a = a+' '+b;
		} else if (typeof a === 'number') {
			let A = a.toString();
			let B = b.toString();
			a = Number(a+b);
		} else if (typeof a === 'object') {
			loop(b, (i,v)=>{ a[i] = v; });
		}
	} catch {
		log(3, 'merge :: Variables are not identical');
		return 0;
	}
	return a;
}

// Add metadata to variable's prototype
function mdata(Var, metadata) {
	merge(Var.prototype, metadata);
}

// Create a new object with prototype metadata
// ex:  const cat = Obj('cat');
function Obj(name, _data, _addmeta) {
	let new_obj;
	let metadata = {
		Name: name,
		Type: 'Object',
		Created: time()
	};
	if (_addmeta) { merge(metadata, _addmeta); }
	if (_data) { merge(new_obj, _data); }
	loop(metadata, (i,v)=>{
		new_obj.prototype[i] = v;
	});
}
// ex:  const cat = Arr('cat', 0, {Info: 'It meows'});
function Arr(name, _data, _addmeta) {
	const metadata = { Type: 'Array' };
	if (_addmeta) { merge(metadata, _addmeta); }
	Obj(name, _data, metadata);
}

// Strip data from base64 URL
function url64(url) {
	return url.replace(/^data:[A-z]+\/?[A-z]+;base64,[ ]?/g, '');
}

// Generate a simple unique id, optionally put a string in the front
function uid(_str) {
	return (_str || '') + Math.floor(Math.random() * 0xFFF).toString(16) +
	'-'+ Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(6, '0');
}


	// TIMERS & ITERATIONS

// A timer in ticks, returns 1 (true) if passed
// Set a unique id if the timer is not global
function clock(tick, _id) {
	let t;
	if (uid && !va2.temp.clock[_id]) {
		va2.temp.clock[_id] = 0;
	}
	if (va2.temp.clock[_id]) {
		va2.temp.clock[_id]++;
		t = va2.temp.clock[_id];
		if (t === tick) {
			va2.temp.clock[_id] = 0;
			return 1;
		}
	} else {
		va2.temp.clock.global++;
		t = va2.temp.clock.global;
		if (t === tick) {
			va2.temp.clock.global = 0;
			return 1;
		}
	}
}

// Intervals with IDs and seconds
const interval = {};
interval.set = function(id, func, sec) {
	let ms = sec*1000;
	va2.temp.intervals[id] = {
		self: setInterval(func, ms),
		func: func,
		ms: ms
	};
}
// Check if interval exists
interval.get = function(id) {
	if (va2.temp.intervals[id]) {
		return va2.temp.intervals[id];
	}
	return false;
}
// Remove the interval
interval.rm = function(id) {
	if (va2.temp.intervals[id]) {
		clearInterval(va2.temp.intervals[id].self);
		delete va2.temp.intervals[id];
	}
}
// Update and restart the interval
interval.reset = function(id, _func, _sec) {
	let it = va2.temp.intervals[id];
	let func = _func || it.func;
	let ms = _sec || it.ms;
	clearInterval(it.self);
	delete it.self;
	it.self = setInterval(func, ms*1000);
	return it;
}

// Timeouts with IDs and seconds
const timeout = {};
timeout.set = function(id, func, sec) {
	let ms = sec*1000;
	va2.temp.timeouts[id] = {
		self: setTimeout(func, ms),
		func: func,
		ms: ms
	};
}
// Check if timeout exists
timeout.get = function(id) {
	if (va2.temp.timeouts[id]) {
		return va2.temp.timeouts[id];
	}
	return false;
}
// Remove the timeout
timeout.rm = function(id) {
	if (va2.temp.timeouts[id]) {
		clearTimeout(va2.temp.timeouts[id].self);
		delete va2.temp.timeouts[id];
	}
}
// Update and restart the timeout
timeout.reset = function(id, _func, _sec) {
	let it = va2.temp.timeouts[id];
	let func = _func || it.func;
	let ms = _sec || it.ms;
	clearTimeout(it.self);
	delete it.self;
	it.self = setTimeout(func, ms*1000);
	return it;
}

// Return current time/date/timeElapsed as a string
va2.env.sessionStart = new Date();
function time(_separator) {
	let x = (_separator || ':');
	let now = new Date();
	let h = now.getHours();
	let m = now.getMinutes();
	let s = now.getSeconds();
	if (h.toString().length==1) {h = '0'+h;}
	if (m.toString().length==1) {m = '0'+m;}
	if (s.toString().length==1) {s = '0'+s;}
	return h+x+m+x+s;
}
function date(_separator) {
	let x = (_separator || '/');
	let now = new Date();
	let dd = now.getDate();
	let mm = now.getMonth()+1;
	let yyyy = now.getFullYear();
	if (dd.toString().length==1) {dd = '0'+dd;}
	if (mm.toString().length==1) {mm = '0'+mm;}
	return yyyy+x+mm+x+dd;
}
function timedate() { return date()+', '+time(); }
function elapsed() {
	let current = new Date();
	let dif = (current - va2.env.sessionStart)/1000;
	let s = Math.floor(dif%60);
	let m = Math.floor((dif/60)%60);
	let h = Math.floor((dif/60)/60)%24;
	return h+'h '+m+'m '+s+'s';
}

// Promise simplified
// ex:  await wait(0.5, ()=>{}, ()=>{});
function wait(sec, _func_before, _func_after) {
	return new Promise((done) => {
		if (_func_before) { _func_before(); }
		setTimeout(() => {
			done(1);
		}, sec*1000);
	}).then((finalize) => {
		if (_func_after) { _func_after(); }
	});
}

// Flexible iteration loop (awaitable)
// target - Array, Object or Number
// ex:  loop(myArr, (i,v)=>{ console.log(i,v) });
function loop(target, func) {
	let item = target;
	let n = 0;
	if (tostring(target).match('RegExp')) {
		item = [...item];
	}
	return new Promise((r) => {
		if (type(item) === 'number') {
			for (let i=0; i<item; i++) { func(i); }
		}
		else if (type(item) === 'object') {
			for (const [i,v] of Object.entries(item)) {
				func(i,v,n);
				n++;
			}
		} else if (type(item) === 'array') {
			for (let i=0; i<item.length; i++) {
				let v = item[i];
				func(i,v);
			}
		}
	}).then((done) => {
		print(item)
		return 1;
	});
}

// Recursive object pairs loop
function rloop(obj, func) {
	loop(obj, (i,v)=>{
		func(i,v);
		if (typeof v === 'object') {
			rloop(v, func);
		}
	});
}

// Find a value in object recursively
function oseek(obj, ind_or_val) {
	let r = ind_or_val;
	let found;
	rloop(obj, (i,v)=>{
		if ((i === r) || (v === r)) {
			found = [i,v];
		}
	});
	return found;
}

// Replace a value in object recursively
function orep(obj, ind_or_val, _newval) {
	loop(obj, (i,v)=>{
		if ((i===ind_or_val) || (v===ind_or_val)) {
			if (_newval || _newval === 0) {
				obj[i] = _newval;
			}
		} else if (typeof v === 'object') {
			orep(v, ind_or_val, _newval);
		}
	});
}

// Copy contents of one obj/arr to another (for elements use merge())
function oclone(from_obj, to_obj) {
	if (!from_obj || !to_obj) {
		return 0;
	}
	loop(from_obj, (i,v)=>{
		//to_obj[i] = v;
		if (type(v) === 'object') {
			if (type(to_obj[i]) !== 'object') {
				to_obj[i] = {};
			}
			oclone(v, to_obj[i]);
		} else if (type(v) === 'array') {
			if (type(to_obj[i]) !== 'array') {
				to_obj[i] = [];
			}
			oclone(v, to_obj[i]);
		} else {
			to_obj[i] = v;
		}
	});
}

// Sort object keys in alphabet order
// Returns an array of two indexes -> [int, str]
// For example: [1: 'a', 2: 'b'] or {a: 0, b: 0}
function osort(obj) {
	const _index = [],
		_clone = {};

	_clone.merge(obj);

	loop(obj, (i,v)=>{
		_index.push(i);
		delete obj[i];
	});
	_index.sort();

	loop(_index, (_,i)=>{
		obj[i] = _clone[i];
	});

	return _index;
}


	// CONSOLE

// Push a log entry in the console and the element with id "console"
// lvl: 0=stdout 1=info 2=warn 3=error 4=crash
function log(lvl, ...data) {
	let em = emi('console');
	let levels = va2.n.loglvl;
	loop(data, (_,msg)=>{
		if (em) {
			let levels = [
			"<x style='color:#49b'>STDOUT</x>",
			"<x style='color:#4b7'>INFO</x>",
			"<x style='color:#c74'>WARN</x>",
			"<x style='color:#c24'>ERROR</x>",
			"<x style='color:#74a'>CRASH</x>" ];
			em.innerHTML = em.innerHTML+
			`<p>[<x style='color:var(--fontColorX)'>${time()}</x>][${levels[lvl]}]: `+
			(msg || 0).toString() + '</p><br>';
		}
		console.log(`[${time()}][${levels[lvl]}]:`, msg);
	});
}

// Print any data in the console and the element with id "console"
function print(...data) {
	const em = emi('console');
	loop(data, (_,msg)=>{
		if (em) {
			em.innerHTML = em.innerHTML + `[${time()}]: ${(msg || 0).toString()}<br>`;
		}
		console.log(`[${time()}]:`, msg);
	});
}

// Print formatted with CSS data in the console and the element with id "console"
function printf(data, css_style) {
	const em = emi('console');
	if (em) {
		em.innerHTML = em.innerHTML +
		`[${time()}]:<div style="${css_style}">${tostring(data)}</div>`;
	}
	console.log('%c'+data, css_style);
}

// Throw a WARN per func_name that element does not exist
function em_err(func_name, em_id) {
	log(2, `${func_name} :: Element "${em_id}" does not exist`);
}


	// ELEMENTS

// Return element (or) by id (emi = em or id)
// This function will be represented as arguments [em_i] and [root_em_i] further on
function emi(em_or_id) {
	if (typeof em_or_id === 'object') {
		return em_or_id;
	} else if (document.getElementById(em_or_id)) {
		return document.getElementById(em_or_id);
	} else {
		return null;
	}
}

// Get a list of elements with the specified CSS class:
// emcl('').loop((i,em)=>{ ... });
function emcl(classname) {
	if (document.getElementsByClassName(classname)) {
		return document.getElementsByClassName(classname);
	}
}

// Return all children of the element by tag
function tags(root_em_i, tag) {
	if (emi(root_em_i)) {
		return [...emi(root_em_i).querySelectorAll(tag)];
	} else {
		em_err('tags',  root_em_i);
	}
}

// Toggle the state of an element (0 or 1)
function emtoggle(em_i, _func) {
	let em = emi(em_i);
	if (em.dataset.condition === '1') {
		em.dataset.condition = 0;
	} else {
		em.dataset.condition = 1;
	}
	if (_func) {
		_func(Number(em.dataset.condition));
	}
}

// Return nth: parent (root) / child (item)
function emroot(em_i, _level) {
	let em = emi(em_i);
	let lvl = _level || 1;
	if (em && em.tagName) {
		let str = '.parentNode';
		return eval('em'+str.repeat(lvl));
	} else {
		log(2, 'emroot :: Element not found');
	}
}
function emitem(em_i, _number) {
	let em = emi(em_i);
	let num = _number || 0;
	if (em && em.tagName) {
		return em.children[num];
	} else {
		log(2, 'emitem :: Element not found');
	}
}

// Do something with all children of an element
function emitems(em_i, _func) {
	const em = emi(em_i),
		_items = [];
	for (const child of em.children) {
		if (_func) { _func(child); }
		_items.push(child);
	}
	return _items;
}

// Change root of an element or return it back
function emchroot(em_i, root_em_i, _switch_between) {
	let em = emi(em_i);
	let root = emi(root_em_i);
	if (em) {
		let oldroot = va2.temp.em_root[em.dataset.uid];
		if (!oldroot) {
			em.dataset.uid = uid('em_');
			va2.temp.em_root[em.dataset.uid] = emroot(em, 1);
		}
		if (!root) {
			if (oldroot) { oldroot.appendChild(em); }
		} else {
			if (_switch_between && (root === emroot(em, 1))) {
				if (oldroot) {
					oldroot.appendChild(em);
				} else {
					log(2, 'em_chroot :: Specified root is the same as current');
				}
			} else {
				root.appendChild(em);
			}
		}
	} else {
		em_err('em_chroot', tostring(em_i));
	}
}

// Return calculated properties of the element
function embox(em_i) {
	const em = emi(em_i),
		rect = em.getBoundingClientRect();
	const box = {
		x: rect.left,
		x2: rect.right,
		y: rect.top,
		y2: rect.bottom,
		w: em.offsetWidth,
		h: em.offsetHeight
	};
	box.cx = box.x + (box.w/2);
	box.cy = box.y + (box.h/2);
	return box;
}

// Find all elements, ids of which contains...
function idmatch(str) {
	return document.querySelectorAll(`[id*="${str}"]`);
}

// Check if element is at position of the cursor
function findem(em_i) {
	let em = emi(em_i);
	let found = false;
	loop(inspect(), (_,em)=>{
		if (em.id == id) {
			found = true;
		}
	});
	return found;
}

// List all elements at the specified coords or cursor position
function inspect(_x, _y) {
	const box = {};
	let x = _x, y = _y;
	if (!_x) { x = va2.cur.x; }
	if (!_y) { y = va2.cur.y; }

	if (document.elementsFromPoint) {
		let queue = document.elementsFromPoint(x, y);
		loop(queue, (i,v)=>{
			if ((v.tagName!=='HTML') && (v.tagName!=='BODY') && (v.tagName!=='VA2OBJ')) {
				box[queue.indexOf(v)] = v;
			}
		});
	} else {
		alert('Your browser does not support "document.elementsFromPoint()".');
	}

	return box;
}

// Create a new element
function create(tag, _data, _root_em_i) {
	let em = document.createElement(tag || 'div');
	let root = _root_em_i || document.body;
	if (_data) {
		loop(_data, (i,v)=>{
			em[i] = v;
		});
	}
	emi(root).appendChild(em);
	return em;
}

// Make element(s) within the specified root element
// (Set [root_em_i] to 0 to use document.body)
function mk(root_em_i, ...html_or_em) {
	let em;

	if (emi(root_em_i)) {
		em = emi(root_em_i);
	} else {
		em = document.body;
	}

	loop(html_or_em, (i,v)=>{
		if (typeof v === 'object') {
			em.appendChild(v);
		} else if (typeof v === 'string') {
			em.insertAdjacentHTML('beforeend',v);
		}
	});
}

// Remove element(s)
function rm(...em_i) {
	loop(em_i, (_, em)=>{
		if (emi(em)) { emi(em).remove(); }
	});
}

// Make element(s) empty
function wipe(...em_i) {
	loop(em_i, (_, em)=>{
		if (emi(em)) {
			emi(em).innerHTML = '';
		} else {
			em_err('wipe',  em);
		}
	})
}

// Add/remove class of an element
function addclass(em_i, classname) {
	let em = emi(em_i);
	if (em) {
		em.classList.add(classname);
	} else {
		em_err('setclass', em_i);
	}
}
function rmclass(em_i, classname) {
	let em = emi(em_i);
	if (em) {
		em.classList.remove(classname);
	} else {
		em_err('setclass', em_i);
	}
}
// Same but switch between add and rm per call
function setclass(em_i, classname) {
	let em = emi(em_i);
	if (em) {
		if (em.className.match(classname)) {
			em.classList.remove(classname);
		} else {
			em.classList.add(classname);
		}
	} else {
		em_err('setclass', em_i);
	}
}
// Check if element has a specified class
function getclass(em_i, classname) {
	return emi(em_i).classList.contains(classname);
}

// Add class to an element on hover
// Optionally trigger on- and off- hover funcs
function hover(em_i, css_class, _func_on, _func_off) {
	const em = emi(em_i);
	if (em) {
		em.onmouseover = ()=>{
			if (css_class) { addclass(em, css_class); }
			if (_func_on) { _func_on(em); }
		}
		em.onmouseout = ()=>{
			if (css_class) { rmclass(em, css_class); }
			if (_func_off) { _func_off(em); }
		}
	} else {
		em_err('hover', em_i);
	}
}

// Show element(s)
// display: 0=block 1=flex 2=grid
function show(display, ...ems_or_ids) {
	loop(ems_or_ids, (_, id)=>{
		if (emi(id)) {
			emi(id).style.display = va2.n.display[display];
		} else {
			em_err('show',  id);
		}
	});
}

// Hide element(s) (display: none)
function hide(...ems_or_ids) {
	loop(ems_or_ids, (_, id)=>{
		if (emi(id)) { emi(id).style.display = 'none'; }
		else { em_err('hide',  id); }
	});
}

// Toggle visibility (display) of an element
function tshow(display, ...ems_or_ids) {
	loop(ems_or_ids, (_, id)=>{
		if (emi(id)) {
			if (emi(id).style.display=='none') {
				show(display, id);
			} else {
				hide(id);
			}
		} else {
			em_err('tshow', id);
		}
	});
}

// Show any element on hover
function hshow(root, display, ...ems_or_ids) {
	if (emi(ems_or_ids)) {
		emi(root).onmouseover = ()=>{
			loop(ems_or_ids, (_, id)=>{ va2.show(display, id); });
		}
		emi(root).onmouseout = ()=>{
			loop(ems_or_ids, (_, id)=>{ va2.hide(id); });
		}
	} else {
		em_err('hshow', ems_or_ids);
	}
}

// Set text content of an element
// (each data entry is separated by <br>)
function text(em_i, ...data) {
	if (emi(em_i)) {
		emi(em_i).textContent = '';
		loop(data, (_, txt)=>{
			emi(em_i).textContent =
			emi(em_i).textContent + txt;
		});
	} else {
		em_err('text',  em_i);
	}
}

// Format links in text
function links(html_str) {
	const reg = /(http[s]?\:((\/\/)|(&#47;&#47;))(.*?))([ ,:\[\]'"\<\>\n]|$)/gm;
	const links = html_str.matchAll(reg);
	loop(links, (_,v)=>{
		html_str = html_str.replace(v[1],
			`<a href='${v[1]}' target='_blank'>${v[1]}</a>`);
	});
	return html_str;
}

// Format hexadecimals into coloured inline elements
function hexcol(str_or_hex) {
	const hex = tostring(str_or_hex).match(/((0x|(?<!&)#)[0-9a-fA-F]{3,8})/gm);
	loop(hex, (_,v)=>{
		let cssv = v.replace('0x', '#');
		str_or_hex = str_or_hex.replaceAll(v, `<i style='color: ${cssv}'>${v}</i>`);
	});
	return str_or_hex;
}

// Input: On Enter key press event (passes em to func)
function enter(em_i, func) {
	const em = emi(em_i);
	if (em) {
		if (!em.uid) {
			em.uid = uid('__input::');
		}

		let data = va2.temp.enter[em.uid];
		if (data) {
			em.removeEventListener('keydown', data);
			delete va2.temp.enter[em.uid];
		}

		data = (e)=>{
			if (e.keyCode === 13) { func(em); }
		}
		em.addEventListener('keydown', data);
		va2.temp.enter[em.uid] = data;
	}
}

// Scroll to coordinates or element
function scrollto(em_i_or_x_coord, _y_coord) {
	const dest = em_i_or_x_coord;
	if (emi(dest)) {
		emi(dest).scrollIntoView();
	} else if (type(dest) === 'number') {
		scrollTo(dest, _y_coord || 0);
	}
}

// Animate an element, optionally set a timer to clear the animation
function ani(em_i, animation, _timer_sec, _hide) {
	const em = emi(em_i);
	if (em) {
		em.style.animation = null;
		void em.offsetWidth; // Animation reflow
		em.style.animation = animation;
		if (_timer_sec) {
			setTimeout(()=>{
				em.style.animation = null;
				if (_hide) { hide(em); }
			}, _timer_sec*1000);
		}
	} else { em_err('ani', em_i); }
}

// Change context menu of an element
function ctxt(em_i, func) {
	const em = emi(em_i);
	em.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		func(em);
		return false;
	}, false);
}

// Slider widget function ('n': Next, 'p': Previous), ex:
// <p onclick="va2slide('cat', 'n')">cats</p>
// <img id='cat1'> <img id='cat2'>
function va2slide(id, dir) {
	const slides = va2.temp.slide;

	// Create slides[id] array if not found
	if (typeof slides[id] === 'undefined') {
		slides[id]=[];
		loop(document.querySelectorAll(`[id^=${id}]`), (i,v)=>{
			slides[id].push(i);
			if (i>1 && emi(id+i)) { emi(id+i).classList.add('slided'); }
			if (!emi(id+i)) { em_err('slide', id+i); }
		});
	}

	// Change class for this [id] and switch to next
	if (dir=='n') {
		if (emi(id+slides[id][0])) {
			emi(id+slides[id][0]).classList.remove("slide", "slideN", "slideP");
			emi(id+slides[id][0]).style.animation = null;
			emi(id+slides[id][0]).classList.add("slided");
		}
		slides[id][0] = slides[id][0]+1;
		if (emi(id+slides[id][0])) {
		// Change class for the new [id]
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideN");
		} else {
		// If next [id] doesn't exist, set index to 1 and change class
			slides[id][0] = 1;
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideN");
		}
	}

	// Change class for this [id] and switch to previous
	if (dir=='p') {
		if (emi(id+slides[id][0])) {
			emi(id+slides[id][0]).classList.remove("slide", "slideP", "slideN");
			emi(id+slides[id][0]).style.animation = null;
			emi(id+slides[id][0]).classList.add("slided");
		}
		slides[id][0] = slides[id][0]-1;
		if (emi(id+slides[id][0])) {
		// Change class for the new [id]
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideP");
		} else {
		// If previous [id] doesn't exist, set index to [max] and change class
			slides[id][0] = slides[id].length;
			emi(id+slides[id][0]).classList.remove("slided");
			emi(id+slides[id][0]).classList.add("slide", "slideP");
		}
	}

	// Change classes for this and selected [id]
	if (typeof dir=='number' && emi(id+dir)) {
		if (emi(id+slides[id][0])) {
			emi(id+slides[id][0]).classList.remove("slide", "slideN", "slideP");
			emi(id+slides[id][0]).style.animation = null;
			emi(id+slides[id][0]).classList.add("slided");
		}
		slides[id][0] = dir;
		emi(id+slides[id][0]).classList.remove("slided");
		emi(id+slides[id][0]).classList.add("slide");
	}
}

// Shows "__notif" element with specified text
function notify(text, _sec) {
	let sec = _sec || 4;
	let id = '__notif';
	const em = emi(id);
	if (em) {
		show(0, em);
		ani(em, `slideout 0.5s forwards, moveT 0.5s ${sec}s forwards`, sec+1, 1);
		em.innerHTML = text;
	} else { em_err('notify', id); }
}
// Shows "__prompt" element with specified text;
// Passes returned input string to the specified function
function stdin(text, _func_on_enter) {
	let id = '__prompt';
	const em = emi(id);
	if (em) {
		if (em.item(0)) {
			em.item(0).innerHTML = text;
		} else {
			create('p', { innerHTML: text }, em);
			create('input', {
				className: 'input i',
				type: 'text',
				placeholder: '(input area)'
			}, em);
		}
		show(1, em);

		if (_func_on_enter) {
			enter(em.item(1), ()=>{
				_func_on_enter(em.item(1).value);
				em.item(1).value = '';
				hide(em);
			}, true);
		}
	} else { em_err('notify', id); }
}


	// WINDOW & SESSION

// Local (loc) & Session (sess) storage management: set/get/del
// ex:  storage.sess.set('param', val_or_obj);
const storage = {
	loc: {
		['set']: function(id, val) {
			if (typeof val === 'object') {
				window.localStorage.setItem(id, JSON.stringify(val));
			} else {
				window.localStorage.setItem(id, val);
			}
		},
		['get']: function(id) {
			let item;
			try { item = JSON.parse(window.localStorage.getItem(id)); }
			catch { item = window.localStorage.getItem(id); }
			return item;
		},
		del: function(id) {
			window.localStorage.removeItem(id);
		}
	},
	sess: {
		['set']: function(id, val) {
			if (typeof val === 'object') {
				window.sessionStorage.setItem(id, JSON.stringify(val));
			} else {
				window.sessionStorage.setItem(id, val);
			}
		},
		['get']: function(id) {
			let item;
			try { item = JSON.parse(window.sessionStorage.getItem(id)); }
			catch { item = window.sessionStorage.getItem(id); }
			return item;
		},
		del: function(id) {
			window.sessionStorage.removeItem(id);
		}
	}
}

// Set a global CSS variable
function css(CSSVar, val) {
	document.documentElement.style.setProperty('--'+CSSVar, val);
}

// Request full screen mode
function fullscreen() {
	let em = document.documentElement;
	if (!va2.temp.fs) {
		if (em.requestFullscreen) { em.requestFullscreen(); }
		else if (em.webkitRequestFullscreen) { em.webkitRequestFullscreen(); }
		else if (em.msRequestFullscreen) { em.msRequestFullscreen(); }
		va2.temp.fullscreen = 1;
	} else {
		if (document.exitFullscreen) { document.exitFullscreen(); }
		else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
		else if (document.msExitFullscreen) { document.msExitFullscreen(); }
		va2.temp.fullscreen = 0;
	}
}

// Open URL, ex:  href('...', 1);
function href(https, _openInNewTab) {
	if (_openInNewTab) { window.open(https, '_blank'); }
	else { window.open(https, '_self'); }
}

// Set functions for device type (call on init once)
function vport(func_desktop, func_mobile, _percentage) {
	// Height > width by >74%
	let p = (_percentage || 74);

	window.addEventListener('resize', ()=>{
		let h = window.innerHeight;
		let w = window.innerWidth;

		if (Math.per(h, w) > p) {
			func_mobile();
		} else {
			func_desktop();
		}
	});
}

// Copy text from the selected input or string
function copy(em_i_or_str) {
	let data;
	if (emi(em_i_or_str)) {
		const em = emi(em_i_or_str);
		em.select();
		em.setSelectionRange(0, 99999);
		data = em.value;
	} else {
		data = em_i_or_str;
	}
	navigator.clipboard.writeText(data);
}

// Retrieve data from clipboard
async function paste() {
	let txt;
	await navigator.clipboard.readText()
		.then((str) => { txt=str; });
	return txt;
}


	// CALCULATIONS

// Resize item while keeping aspect ratio
function resize(h, w, max, _maxW) {
	let r;
	if (!_maxW) { r = Math.min(max/h, max/w); }
	else { r = Math.min(max/h, _maxW/w); }
	return {
		h: Math.round(h*r),
		w: Math.round(w*r)
	};
}

// Return {int} with {max} limit
function intmax(int, max) {
	return Math.min(max, Math.max(0, int));
}

// Invert a float (ex: 0.9=90% to 0.9=10%)
function invfloat(float) {
	return 1 - (1 * float);
}

// Calculate percentage
Math.per = function(this_num, of_the) {
	return Math.round( (100 * this_num) / of_the );
}

// Get polarity (1, -1, 0) of a number in comparison to other or 0
Math.pol = function(this_n, _to_n) {
	let x = (_to_n || 0);
	if (this_n>x) { return 1; }
	else if (this_n<x) { return -1; }
	else { return 0; }
}

// Generate a random hexadecimal color
function hexrand() {
	return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}


	// PROTOTYPES

String.prototype.toraw = function() { return String.raw`${this}`; }
String.prototype.len = function() { return len(this); }
String.prototype.cut = function(start, _plus) {
	return cut(this, start, _plus);
}

Number.prototype.len = function() { return len(this); }
Number.prototype.cut = function(start, _plus) {
	return cut(this, start, _plus);
}

Object.prototype.len = function() { return len(this); }
Object.prototype.clone = function(to) { oclone(this, to); }
Object.prototype.sort = function() { return osort(this); }
Object.prototype.toggle = function(func) { return emtoggle(this, func); }
Object.prototype.box = function() { return embox(this); }
Object.prototype.root = function(lvl) { return emroot(this, lvl); }
Object.prototype.chroot = function(root_em_i, _switch_between) {
	return emchroot(this, root_em_i, _switch_between);
}
Object.prototype.item = function(number) { return emitem(this, number); }
Object.prototype.items = function(func) { return emitems(this, func); }
Object.prototype.hover = function(css_class, _func_on, _func_off) {
	return hover(this, css_class, _func_on, _func_off);
}
Object.prototype.seek = function(what) { return oseek(this, what); }
Object.prototype.rep = function(item, _newitem) {
	return orep(this, item, _newitem);
}
Object.prototype.merge = function(o) {
	merge(this, o);
};
// Loop / async loop, ex:  myArr.loop((i,v)=>{ print(i,v); });
Object.prototype.loop = function(func) {
	loop(this, func);
};
Object.prototype.aloop = async function(func) {
	await loop(this, func);
};

Array.prototype.len = function() { return len(this); }
// Return last item of array
Array.prototype.last = function() { return this[this.length-1]; }
// Remove specific item from array
Array.prototype.rm = function(value) {
	const index = this.indexOf(value);
	if (index > -1) {
		this.splice(index, 1);
	}
}


	// SCRIPT EVENTS

document.addEventListener('keydown', (e)=>{
	va2.key.id = e.keyCode;
	va2.key.event = 'down';
	va2.key.held = 1;
	va2.key.name = e.code
		.replace('Key', '')
		.replace('Digit', '')
		.toLowerCase();
});
document.addEventListener('keyup', (e)=>{
	va2.key.id = e.keyCode;
	va2.key.event = 'up';
	va2.key.held = 0;
	va2.key.name = e.code
		.replace('Key', '')
		.replace('Digit', '')
		.toLowerCase();
});

document.addEventListener('mousedown', (e)=>{
	let x = e.clientX, y = e.clientY;
	va2.cur.event = 'down';
	if (va2.cur.type !== 'touch') {
		va2.cur.type = 'mouse';
	}
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.down = {x: x, y: y};
	va2.cur.held = 1;
});
document.addEventListener('mousemove', (e)=>{
	let x = e.clientX, y = e.clientY;
	va2.cur.event = 'move';
	//va2.cur.type = 'mouse';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.move = {x: x, y: y};

	// Get cursor polarity in comparison to screen center
	va2.cur.pol = {
		x: Math.pol(x, window.innerWidth / 2),
		y: Math.pol(y, window.innerHeight / 2)
	};
});
document.addEventListener('mouseup', (e)=>{
	let x = e.clientX, y = e.clientY;
	va2.cur.event = 'up';
	//va2.cur.type = 'mouse';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.up = {x: x, y: y};
	va2.cur.held = 0;
});

document.addEventListener('touchstart', (e)=>{
	let x = e.touches[0].clientX,
		y = e.touches[0].clientY;
	va2.cur.event = 'down';
	va2.cur.type = 'touch';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.down = {x: x, y: y};
	va2.cur.held = 1;
});
document.addEventListener('touchmove', (e)=>{
	let x = e.touches[0].clientX,
		y = e.touches[0].clientY;
	va2.cur.event = 'move';
	//va2.cur.type = 'touch';
	va2.cur.x = x;
	va2.cur.y = y;
	va2.cur.move = {x: x, y: y};

	// Get cursor polarity in comparison to screen center
	va2.cur.pol = {
		x: Math.pol(x, window.innerWidth / 2),
		y: Math.pol(y, window.innerHeight / 2)
	};
});
document.addEventListener('touchend', (e)=>{
	va2.cur.event = 'up';
	//va2.cur.type = 'touch';
	va2.cur.held = 0;
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
	let theme = event.matches ? 'dark' : 'light';
	const BODY = document.body;
	if (theme === 'dark') {
		rmclass(BODY, 'theme-light');
		addclass(BODY, 'theme-dark');
	} else {
		rmclass(BODY, 'theme-dark');
		addclass(BODY, 'theme-light');
	}
	log(0,`theme: ${theme}`);
});

// SCRIPT INIT
va2.env.init[0] = ()=>{
	if (!CSS.supports('height: 100dvh')) {
		document.documentElement.style.setProperty('--dvh', window.innerHeight+'px');
	}
	if (typeof twemoji !== 'undefined') {
		twemoji.parse(document.documentElement, {folder: 'svg', ext: '.svg'});
	}
	const BODY = document.body;
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		rmclass(BODY, 'theme-light');
		addclass(BODY, 'theme-dark');
	} else {
		addclass(BODY, 'theme-light');
		rmclass(BODY, 'theme-dark');
	}
	tags(document.body, 'input').loop((_,em)=>{
		em.spellcheck = undefined;
	});
}

// CHECK VERSION
console.log('Va2 version: 0x'+va2.ver.toString(16));
if (emi('va2meta')) {
	let local_ver = emi('va2meta').dataset.ver;
	let diff = va2.ver - Number(local_ver);
	console.log('Va2 local version: '+local_ver);

	if (diff >= va2.verBytes.minor) {
		console.log('%cVa2: New significant release. Some globals might have changed. '+
		'Please compare your files with the current version at: '+
		'https://github.com/reineimi/va2/tree/main/lib',
		'background: #000; color: #fb7; font-size: 20px; padding: 0.5em 1em; border-radius: 1em');
	}
}

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:. https://github.com/reineimi/VPCDP .:  */
