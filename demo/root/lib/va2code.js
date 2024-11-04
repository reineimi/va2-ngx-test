// Simple pattern-match code highlighting
"use strict";
va2.env.mod_code = {
	langs: {
		lua: {},
		js: {},
		css: {},
		html: {}
	}
}

// List of languages here
va2.env.mod_code.init = function() {
	let hl = va2.env.mod_code.langs;
	// All languages (brackets does not match for unknown reason)
	va2.env.mod_code.meta = {
		strings: [
			/"(.(?![\n]))*?"/gm,
			/'(.(?![\n]))*?'/gm,
			/`(.?[\n]?)*?`/gm,
			/\[\[(.?[\n]?)*?\]\]/gm
		],
		comments: [
			/(?<!["'`])((^)|[\n	 ])--(.(?![`"']))*?([\n]|$)/gm,
			/(?<!["'`])((^)|[\n	 ])#(.(?![`"']))*?([\n]|$)/gm,
			/(?<!["'`])((^)|[\n	 ])(&#47;)(&#47;)(.(?![`"']))*?([\n]|$)/gm,
			/(&#47;)\*(.?[\n]?)*?\*(&#47;)/gm,
			/--[[(.*?)]]/gm
		],
	}
	va2.env.mod_code.tags = {
		strings: '<s>',
		comments: '<c>',
		numbers: '<n>'
	}

	// Lua programming language
	hl.lua.operators = [ // For other langs too
		/\=/gm, /\:/gm,
		/\,/gm, /\./gm,
		/\{/gm, /\}/gm,
		/\(/gm, /\)/gm,
		//(?<!\[)\[(?!\[)/gm, /(?<!\])\](?!\])/gm,
		'local', 'let', 'const', 'var', 'int',
		'nil', 'null', 'undefined', 'true', 'false',
		'function', 'end', 'return', 'import',
		'if', 'and', 'then', 'for', 'in', 'while', 'do',
		'not', 'else', 'elseif', 'break', 'case', 'switch',
		'new', 'delete', 'async', 'await', 'void'
	];
	hl.lua.vars = [
		'_ENV', '_G', '_VERSION', 'io', 'os',
		'require', 'package', 'module',
		'collectgarbage',
		'table', 'pairs', 'ipairs', 'type',
		'math', 'string',  'debug', 'coroutine',
		'self'
	];
	hl.lua.methods = [
		'print', 'read', 'open', 'write', 'close',
		'popen', 'execute', 'exit',
		'date', 'time', 'clock',
		'sub', 'gsub', 'match', 'gmatch', 'find',
		'format', 'char', 'len', 'utf8',
		'tostring', 'tonumber', 'load',
		'pcall', 'xpcall', 'error', 'warn', 'assert',
		'status', 'create', 'yield', 'wrap',
		'setmetatable', 'getmetatable',
		'loadfile', 'select', 'next',
		'floor', 'ceil', 'mod'
	];

	// JavaScript
	hl.js.operators = hl.lua.operators;
	hl.js.vars = [
		'prototype', 'Object', 'Array', 'Map',
		'Set', 'Function', 'Date', 'RegExp',
		'Number', 'Boolean', 'String', 'Symbol',
		'Null', 'Undefined', 'Bigint', 'Math',
		'Promise', 'this', 'typeof'
	];
	hl.js.methods = [
		'remove', 'replace', 'find', 'match',
		'toLowerCase', 'toUpperCase', 'all'
	];

	// Adjustments
	loop(hl, (lang, langobj)=>{
		loop(langobj, (_type, regobj)=>{
			// Correct the single-word patterns
			loop(regobj, (i, reg)=>{
				if (typeof reg === 'string') {
					regobj[i] = regex(`(?<![_.A-z0-9]+)${reg}(?![_A-z0-9]+)`);
				}
			});
			// Generate default color tags
			va2.env.mod_code.tags[_type] = `<${cut(_type, 0, 1)}>`;
		});
	});
}
va2.env.mod_code.init();

va2.mod.code = function(lang, str) {
	if (!va2.env.mod_code.langs[lang]) {
		str = str
		.replaceAll(/[\n]/gm, '<br>')
		.replaceAll('  ', '<tab></tab>')
		.replaceAll('	', '<tab></tab>');
		return hexcol(links(str));
	}

	// Replace special characters
	str = str.toraw()
		.replaceAll('$', '&#36;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('/', '&#47;');
		//.replaceAll('&', '&#38;');

	// For the specified language
	loop(va2.env.mod_code.langs[lang], (_type, regobj)=>{
		let tag = va2.env.mod_code.tags[_type];
		let tagx = tag.replace('<', '</');
		// Loop through regex lists
		loop(regobj, (_, reg)=>{
			if (str.match(reg)) {
				let val = reg.exec(str)[0];
				str = str
				.replaceAll(tag+val+tagx, val)
				.replaceAll(reg, tag+val+tagx);
			}
		});
	});

	/* Numbers
	let num = /(0x[0-9abcdefABCDEF]+)|[ (\[\,\;\-\+\=]([0-9]+)[.]?[0-9\)\]\,\;$]?/gm;
	loop(str.matchAll(num), (_,v)=>{
		str = str.replace(v[2], `<n>${v[2]}</n>`);
	}); //*/

	// For all languages
	loop(va2.env.mod_code.meta, (_type, regobj)=>{
		let tag = va2.env.mod_code.tags[_type];
		let tagx = tag.replace('<', '</');
		// Loop through regex lists
		loop(regobj, (_, reg)=>{
			if (str.match(reg)) {
				str.match(reg).loop((_,v)=>{
					// Remove inner tags
					let x = v.replaceAll(/<[\/]?(.*?)>/gm, '');
					//if (_type==='numbers') {print(v,x);}
					//if (_type==='comments') {print(v,x);}
					//if (_type==='strings') {print(v,x);}
					// Create the new one
					str = str
					.replaceAll(tag+v+tagx, v)
					.replaceAll(v, tag+x+tagx);
				});
			}
		});
	});

	// Format special characters
	str = str
		.replaceAll(/[\n]/gm, '<br>')
		.replaceAll('  ', '<tab></tab>')
		.replaceAll('	', '<tab></tab>');

	// Make links clickable; add hex colors
	return hexcol(links(str));
}

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:. https://github.com/reineimi/VPCDP .:  */
