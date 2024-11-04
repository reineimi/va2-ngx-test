// The "No Click" movement:
// Preserve the lifespan of your precious mouse!
// (hover over element to trigger onclick event)
va2.mod.noclick = {
	// Focus speed, in seconds
	speed: 0.4,
	// Remove "onclick" event
	remove_click: 0,
	// Print the UIDs of all modified elements
	logging: 0
}

/* The function itself:
id_or_em: Str||Obj, // Element or element.id
_sec: Float, // Hover time in seconds
_args: {
	click: Func,
	focus: Func, // Onmouseover
	unfocus: Func, // Onmouseout
	log: Bool, // Force logging
	args: Arr // Onclick function header arguments
}
*/
function noclick(id_or_em, _sec, _args) {
	const args = _args || {};
	const em = emi(id_or_em);
	if (!em) { return false; }
	let id = em.dataset.uid,
		sec = _sec || va2.mod.noclick.speed,
		click = args.click,
		focus = args.focus,
		unfocus = args.unfocus;

	// Set unique id for the element and its timer
	if (!id) {
		id = uid('em_');
		em.dataset.uid = id;

		// Only pick initial events once:
		if (em.onmouseover) {
			let F = em.onmouseover;
			focus = ()=>{
				F.apply(em);
				if (args.focus) { args.focus(em); }
			}
			em.onmouseover = undefined;
		}

		if (em.onmouseout) {
			let F = em.onmouseout;
			unfocus = ()=>{
				F.apply(em);
				if (args.unfocus) { args.unfocus(em); }
			}
			em.onmouseout = undefined;
		}

		if (em.onclick) {
			let F = em.onclick;
			click = ()=>{
				F.apply(em);
				if (args.click) { args.click(em); }
			}
			em.onclick = undefined;
		}

		if (em.ontouchend) {
			let F = em.ontouchend;
			let F2 = em.onclick;
			touch = ()=>{
				F.apply(em);
				if (F2) { F2.apply(em); }
				if (args.click) { args.click(em); }
			}
			em.ontouchend = undefined;
		}
	}

	// Replace the events
	em.onmouseover = ()=>{
		if (focus) { focus(); }
		if (click) {
			timeout.set(id, ()=>{ click(); }, sec);
		}
	}
	em.onmouseout = ()=>{
		if (unfocus) { unfocus(); }
		if (timeout.get(id)) { timeout.rm(id); }
	}

	// Adapt for touch screens
	em.ontouchend = ()=>{
		em.onclick = undefined;
		em.onmouseover = undefined;
		em.onmouseout = undefined;
		if (touch) { touch(); }
	}

	if (va2.mod.noclick.remove_click) {
		em.onclick = undefined;
	}
	if (va2.mod.noclick.logging || args.log) {
		log(1, `noclick::${id}`);
	}
	return id;
}

// On call, replace ALL existing "onmouseover"
// and "onmouseout" events
va2.mod.noclick.init = function(_logging) {
	const page = document.getElementsByTagName("*");
	for (let i=0; i<page.length; i++) {
		if (page[i].onclick && (page[i].tagName !== 'BODY')) {
			noclick(page[i], va2.mod.noclick.speed, {log: _logging});
		}
	}
}

/* Example:
HTML:
	<div id='test'
		onclick='print("hi")'
		onmouseover='this.style.background = "#eee"'
		onmouseout='this.style.background = "#fff"'
		style='width: 50px; height: 50px; background: #fff'></div>
JS:
	noclick('test', 0.5);
*/

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:. https://github.com/reineimi/VPCDP .:  */
