"use strict";
va2.mod.tables = { cols: 0, rows: 0 };

// Get system theme
va2.mod.tables.theme = function() {
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		rmclass(document.body, 'theme-light');
		addclass(document.body, 'theme-dark');
	} else {
		addclass(document.body, 'theme-light');
		rmclass(document.body, 'theme-dark');
	}
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => { va2.mod.tables.theme(); });
va2.mod.tables.theme();

// Load styles
extern.css(`
#va2tableWrap { display: flex; flex-wrap; font-size: 1.1rem; position: relative; width: 95%; height: calc(var(--dvh) * 0.9); margin: auto; padding-top: 6em; overflow: scroll; }
#va2tableWrap * { font-size: inherit; }

#va2tableWrap table { margin: 0px auto auto 0px; border: 1px solid var(--itemFg); background: var(--red); border-spacing: unset; border-collapse: unset; box-shadow: 1em 1em 3em #0002; }
#va2tableWrap tr { position: relative; margin: 0px; overflow: visible; transition: transform 0.3s; animation: appearFromRB 0.5s; }
#va2tableWrap th,
#va2tableWrap td { background: var(--windowFg); border: 1px solid var(--itemFg); white-space: pre; text-wrap: wrap; text-align: left; line-height: 1.2; position: relative; padding: 0.3em 0.75em; color: inherit; min-width: 12em; height: 3em; transition: transform 0.3s; }
#va2tableWrap th { font-weight: 700; }
#va2tableWrap textarea { all: unset; z-index: 990; text-wrap: wrap; word-break: break-word; box-sizing: border-box; background: var(--windowFg); color: var(--fontColorX); position: absolute; top: 0px; left: 0px; padding: 0.3em 0.75em; width: 100%; height: 100%; }
#va2tableWrap textarea:hover { border: 1px solid var(--yellow); }
#va2tableWrap textarea:focus { border: 1px solid var(--green); word-break: unset; }

#va2tableWrap .va2rowSel { transform: scale(0.9) translateX(2rem); }

#va2tableCleanup { display: table; min-width: 2.5em; margin: 0px 0.5rem 0px 0px; padding-top: 3px; }
#va2tableCleanup > div { cursor: pointer; text-align: center; font-size: 2em !important; padding: 0.15em; }
#va2tableCleanup > div:hover { background: var(--red); color: #fff; }

#va2tableEditor { display: table; position: absolute; top: 0px; left: 0px; white-space: nowrap; padding: 1em 1.5em; margin: 0px 0px 3em 0px; background: var(--windowFg); border: 1px solid var(--itemFg); border-radius: 2em; }
#va2tableEditor * { display: inline-block; margin-right: 0.75em; }
#va2tableEditor button { background: none; font: inherit; font-weight: 600; cursor: pointer; padding: 0.5em 0.75em; border: 0.2rem solid #0000; border-radius: 0.75em; }
#va2tableEditor *:last-child { margin-right: 0px; }

#va2tableWrap .blue { color: var(--blue); border-color: var(--blue); }
#va2tableWrap .green { color: var(--green); border-color: var(--green); }
#va2tableWrap .yellow { color: var(--yellow); border-color: var(--yellow); }
#va2tableWrap .red { color: var(--red); border-color: var(--red); }
#va2tableWrap .pink { color: var(--pink); border-color: var(--pink); }
#va2tableWrap .purple { color: var(--purple); border-color: var(--purple); }

#va2tableWrap button.blue:hover { color: #fff !important; background: var(--blue) !important; }
#va2tableWrap button.green:hover { color: #fff !important; background: var(--green) !important; }
#va2tableWrap button.yellow:hover { color: #fff !important; background: var(--yellow) !important; }
#va2tableWrap button.red:hover { color: #fff !important; background: var(--red) !important; }
#va2tableWrap button.pink:hover { color: #fff !important; background: var(--pink) !important; }
#va2tableWrap button.purple:hover { color: #fff !important; background: var(--purple) !important; }
`, 'va2tables');

// Table wrapper
const va2tableWrap = create(0, {id: 'va2tableWrap'});

// Table editor
const va2tableEditor = create(0, {id: 'va2tableEditor', className: 'nosel'}, 'va2tableWrap');

// Table data cleanup buttons
const va2tableCleanup = create(0, {id: 'va2tableCleanup', className: 'nosel'}, 'va2tableWrap');
const va2tableDelColData = {
	className: 'red',
	innerHTML: '#',
	onclick: ()=>{
		loop(tags('va2table', 'tr'), (i,v)=>{
			rm(emitem(v, va2.mod.tables.cols-1));
		});
		if (va2.mod.tables.cols > 0) {
			va2.mod.tables.cols--;
		}
	}
}
const va2tableDelCol = create(0, va2tableDelColData, 'va2tableCleanup');
// Highlight column on hover
hover(va2tableDelCol, 0, ()=>{
	loop(tags('va2table', 'tr'), (i,v)=>{
		addclass(emitem(v, va2.mod.tables.cols-1), 'va2rowSel');
	});
}, ()=>{
	loop(tags('va2table', 'tr'), (i,v)=>{
		rmclass(emitem(v, va2.mod.tables.cols-1), 'va2rowSel');
	});
});

// > Add column
const va2tableAddCol = create('button', {
	id: 'va2tableAddCol',
	className: 'purple',
	innerHTML: '+ Col',
	onclick: ()=>{
		va2.mod.tables.cols++;
		loop(tags('va2table', 'tr'), (i,v)=>{
			if (i === 0) { create('th', 0, v); }
			else { create('td', 0, v); }
		});
	}
}, 'va2tableEditor');

// > Add row
const va2tableAddRow = create('button', {
	id: 'va2tableAddRow',
	className: 'blue',
	innerHTML: '+ Row',
	onclick: ()=>{
		// Create row
		va2.mod.tables.rows++;
		const row = create('tr', 0, 'va2table');
		loop(va2.mod.tables.cols, (n)=>{
			create('td', 0, row);
		});

		// Add [Delete] button...
		const btn = create(0, {
			className: 'red',
			innerHTML: `${va2.mod.tables.rows}`,
			onclick: ()=>{
				rm(row, btn);
				if (va2.mod.tables.rows > 0) {
					va2.mod.tables.rows--;
				}
			}
		}, 'va2tableCleanup');

		// ...And highlight target row on hover
		hover(btn, 0, ()=>{
			addclass(row, 'va2rowSel');
		}, ()=>{
			rmclass(row, 'va2rowSel');
		});
	}
}, 'va2tableEditor');

// > Edit
const va2tableEdit = create('button', {
	id: 'va2tableEdit',
	className: 'red',
	innerHTML: 'Edit',
	onclick: ()=>{
		toggle('va2table', (state)=>{
			if (state) { // Edit :: Add textarea mask to th/td
				va2tableEdit.innerHTML = 'Save';
				loop(tags('va2table', 'th'), (i,v)=>{
					mk(v, `<textarea onfocusout='emroot(this, 1).innerHTML = this.value'>${v.innerHTML}</textarea>`);
				});
				loop(tags('va2table', 'td'), (i,v)=>{
					mk(v, `<textarea onfocusout='emroot(this, 1).innerHTML = this.value'>${v.innerHTML}</textarea>`);
				});
			} else { // Save :: Remove all masks and save the session
				va2tableEdit.innerHTML = 'Edit';
				rm('va2tableNowEditing');
				loop(tags('va2table', 'textarea'), (i,v)=>{ rm(v); });
				storage.loc.set('va2table_sess', va2table.outerHTML);
			}
		});
	}
}, 'va2tableEditor');

// > Load
va2.mod.tables.loadtable = function() {
	loop(tags('va2table', 'tr'), (i,tr)=>{
		if (i > 0) {
			// Count rows, add [Delete] buttons...
			va2.mod.tables.rows++;
			const btn = create(0, {
				className: 'red',
				innerHTML: `${va2.mod.tables.rows}`,
				onclick: ()=>{
					rm(tr, btn);
					if (va2.mod.tables.rows > 0) {
						va2.mod.tables.rows--;
					}
				}
			}, 'va2tableCleanup');

			// ...And highlight target row on hover
			hover(btn, 0, ()=>{
				addclass(tr, 'va2rowSel');
			}, ()=>{
				rmclass(tr, 'va2rowSel');
			});
		}
		if (i === 0) { // Retrieve amount of cols from the first row
			loop(emitems(tr), ()=>{ va2.mod.tables.cols++; });
		}
	});
}
const va2tableLoad = create('button', {
	id: 'va2tableLoad',
	className: 'yellow',
	innerHTML: 'Load',
	onclick: ()=>{
		extern.file('va2table', va2.mod.tables.loadtable);
	}
}, 'va2tableEditor');

// > Export
const va2tableExport = create('button', {
	id: 'va2tableExport',
	className: 'green',
	innerHTML: 'Export',
	onclick: ()=>{
		let fname = prompt('Save this table as (name):');
		mkfile(fname+'.html', va2table.outerHTML);
	}
}, 'va2tableEditor');

// Table itself
const va2table = create('table', {id: 'va2table'}, 'va2tableWrap');
const va2tableHead = create('tr', {id: 'va2tableHead'}, 'va2table');

// Check for previous session
va2.mod.tables.sess = storage.loc.get('va2table_sess');
if (va2.mod.tables.sess && va2.mod.tables.sess !== '') {
	va2table.innerHTML = va2.mod.tables.sess;
	va2.mod.tables.loadtable();
}
