-- This is page init script
local function include(luafile, _print_err)
	local STAT, ERR_OR_CONTENT = pcall(require, luafile)
	if not STAT then
		return nil
	end
	return ERR_OR_CONTENT
end

-- HTML document
local HEAD = include 'mod.head'
local ONLOAD = include 'mod.onload'
local HEADER = include 'mod.header'
local FOOTER = include 'mod.footer'
local function doc_init(BODY, _sources)
	local src = _sources or {}
	local L = src.onload or ONLOAD
	local H = src.header or HEADER
	local A = src.aside
	local F = src.footer or FOOTER
	local htdoc = {
	'<!DOCTYPE html>',
	'<html lang="en">',
	'<head>', src.head or HEAD or '', '</head>',
	'<body onload="if (typeof(init) === \'function\') { init(); }">',
	}

	if L then
		table.insert(htdoc,
		'<script id="__preload" defer>document.head.insertAdjacentHTML("beforeend", `'
		..L..'`); document.getElementById("__preload").remove();</script>')
	end

	if H then
		table.insert(htdoc, '<header>'..H..'</header>')
		table.insert(htdoc, "<div class='header_padding'></div>")
	end

	table.insert(htdoc, '<main>')

	if A then
		table.insert(htdoc, '<aside>'..A..'</aside>')
	end

	table.insert(htdoc, (BODY or ''))

	if F then
		table.insert(htdoc, '</main>\n<footer>'..F..'</footer>')
	end

	table.insert(htdoc, '</body>\n</html>')

	for _, v in ipairs(htdoc) do
		ngx.say(v)
	end
end

return doc_init
