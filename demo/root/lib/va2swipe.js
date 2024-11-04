const swipe = {
	pointer: 'mouse',
};

// Find closest to zero number in array
function closestToZero(arr) {
	let closest = 0;
	for (let n of arr) {
		if (closest === 0) {
			closest = n;
		} else if (Math.abs(n) > 0 && Math.abs(n) <= Math.abs(closest)) {
			closest = n;
		}
	}
	return closest;
}

// Core swipe function
swipe.start = function(ev, em) {
	// Get start position
	let startX, startY;
	startX = em.event.start.x;
	startY = em.event.start.y;

	// Get current position
	let x, y;
	if (ev.touches) {
		x = ev.touches[0].clientX;
		y = ev.touches[0].clientY;
	} else {
		x = ev.clientX;
		y = ev.clientY;
	}

	// Perform swipe-scrolling
	let destX = em.event.scroll.x - (startX - x),
		destY = em.event.scroll.y - (startY - y);

	if (em.swipeAxis==='xy') {
		em.style.transform = `translate(${destX}px, ${destY}px)`;
	} else if (em.swipeAxis==='x') {
		em.style.transform = `translateX(${destX}px)`;
	} else if (em.swipeAxis==='y') {
		em.style.transform = `translateY(${destY}px)`;
	}

	// Update last scroll position
	em.event.last.x = destX;
	em.event.last.y = destY;
}

// Optional swipe release transition
swipe.end = function(em) {
	// Get center position of root element
	const rootBox = em.parentNode.getBoundingClientRect();
	const center = {
		x: (rootBox.left + rootBox.right) / 2,
		y: (rootBox.top + rootBox.bottom) / 2
	}

	// Get distances of child elements in comparison to parent
	const children = {x: [], y: []};
	for (const child of em.children) {
		const box = child.getBoundingClientRect();
		const style = window.getComputedStyle(child);
		let ml = parseInt(style.marginLeft),
			mr = parseInt(style.marginRight),
			mt = parseInt(style.marginTop),
			mb = parseInt(style.marginBottom),
			x = (box.left + box.right + ml) / 2,
			y = (box.top + box.bottom + mt) / 2,
			distX, distY;

		if (em.swipeX==='center') {
			distX = x - center.x;
		} else if (em.swipeX==='left') {
			distX = (box.left - ml) - rootBox.left;
		} else if (em.swipeX==='right') {
			distX = (box.right + mr) - rootBox.right;
		}

		if (em.swipeY==='center') {
			distY = y - center.y;
		} else if (em.swipeY==='top') {
			distY = (box.top - mt) - rootBox.top;
		} else if (em.swipeY==='bottom') {
			distY = (box.bottom + mb) - rootBox.bottom;
		}

		children.x.push(Math.round(distX));
		children.y.push(Math.round(distY));
	}

	// Find closest to center child...
	let destX = Math.round(em.event.scroll.x - closestToZero(children.x)),
		destY = Math.round(em.event.scroll.y - closestToZero(children.y));

	// ...And scroll into it
	if (em.swipeAxis==='xy') {
		em.style.transform = `translate(${destX}px, ${destY}px)`;
	} else if (em.swipeAxis==='x') {
		em.style.transform = `translateX(${destX}px)`;
	} else if (em.swipeAxis==='y') {
		em.style.transform = `translateY(${destY}px)`;
	}

	// Update last scroll position
	em.event.scroll.x = destX;
	em.event.scroll.y = destY;
}

// Find swipe elements and add event handlers
for (let em of document.getElementsByClassName('swipe')) {
	// Swipe configuration (ex. attr:  data-swipe-delay=0)
	em.swipeAxis = em.dataset.swipeAxis || 'x';
	em.swipeX = em.dataset.swipeX || 'left';
	em.swipeY = em.dataset.swipeY || 'top';
	em.swipeEnd = em.dataset.swipeEnd || '1';
	em.swipeDelay = em.dataset.swipeDelay || 150;

	em.style.display = 'inline-flex';
	em.style.margin = 'auto';

	// Pointer and transition event
	em.event = {
		held: false,
		moved: false,
		start: {x: 0, y: 0},
		scroll: { x: 0, y: 0 },
		last: { x: 0, y: 0 },
	}
}

// Enable/disable scrolling
let supportsPassive = false;
try {
	window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
		get: function () { supportsPassive = true; } 
	}));
} catch(e) {}
let wheelOpt = supportsPassive ? { passive: false } : false;
let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function preventDefault(e) {
	e.preventDefault();
}
function disableScroll() {
	window.addEventListener('DOMMouseScroll', preventDefault, false); // Older Desktop
	window.addEventListener(wheelEvent, preventDefault, wheelOpt); // Desktop
	window.addEventListener('touchmove', preventDefault, wheelOpt); // Mobile
}
function enableScroll() {
	window.removeEventListener('DOMMouseScroll', preventDefault, false);
	window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
	window.removeEventListener('touchmove', preventDefault, wheelOpt);
}

// Viewport swipe handling: Mouse
document.addEventListener('mousedown', function(e) {
	swipe.pointer = 'mouse';
	let x = e.clientX, y = e.clientY, found;
	for (const em of document.elementsFromPoint(x, y)) {
		if (em.classList.contains('swipe')) {
			em.event.start.x = x;
			em.event.start.y = y;
			em.event.held = true;
			em.style.transition = em.swipeDelay+'ms';
			found = true;
		}
	}
	if (found) { disableScroll(); }
});

document.addEventListener('mousemove', function(e) {
	swipe.pointer = 'mouse';
	let x = e.clientX, y = e.clientY;
	for (const em of document.elementsFromPoint(x, y)) {
		if (em.classList.contains('swipe')) {
			if (em.event.held) {
				swipe.start(e, em);
				em.event.moved = true;
			}
		}
	}
});

document.addEventListener('mouseup', function(e) {
	let found;
	for (let em of document.getElementsByClassName('swipe')) {
		found = true;
		if (em.event.held && em.event.moved) {
			em.event.held = false;
			em.event.moved = false;
			em.event.scroll.x = em.event.last.x;
			em.event.scroll.y = em.event.last.y;
			if (em.swipeEnd==='1') {
				setTimeout(()=>{ swipe.end(em); }, em.swipeDelay);
			}
		}
	}
	if (found) { enableScroll(); }
});

// Viewport swipe handling: Touch
document.addEventListener('touchstart', function(e) {
	swipe.pointer = 'touch';
	let x = e.touches[0].clientX,
		y = e.touches[0].clientY, found;

	for (const em of document.elementsFromPoint(x, y)) {
		if (em.classList.contains('swipe')) {
			em.event.start.x = x;
			em.event.start.y = y;
			em.event.held = true;
			em.style.transition = em.swipeDelay+'ms';
			found = true;
		}
	}
	if (found) { disableScroll(); }
});

document.addEventListener('touchmove', function(e) {
	swipe.pointer = 'touch';
	let x = e.touches[0].clientX,
		y = e.touches[0].clientY;

	for (const em of document.elementsFromPoint(x, y)) {
		if (em.classList.contains('swipe')) {
			if (em.event.held) {
				swipe.start(e, em);
				em.event.moved = true;
			}
		}
	}
});

document.addEventListener('touchend', function(e) {
	let found;
	for (let em of document.getElementsByClassName('swipe')) {
		found = true;
		if (em.event.held && em.event.moved) {
			em.event.held = false;
			em.event.moved = false;
			em.event.scroll.x = em.event.last.x;
			em.event.scroll.y = em.event.last.y;
			if (em.swipeEnd==='1') {
				setTimeout(()=>{ swipe.end(em); }, em.swipeDelay);
			}
		}
	}
	if (found) { enableScroll(); }
});

console.log(`[swipe.js@eimirein] :: HTML attributes:
data-swipe-delay	Transition delay in ms (number)
data-swipe-axis		Direction axis ('x', 'y', 'xy')
data-swipe-x		X axis direction ('left', 'right', 'center')
data-swipe-y		Y axis direction ('top', 'bottom', 'center')
data-swipe-end		Enable swipe finish transition (0, 1)`)

/*	: Code above is licensed under VPCDP  :
	: by Eimi Rein (霊音 永旻) - @reineimi  :
	:..https://github.com/reineimi/VPCDP..:  */
