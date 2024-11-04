-- Page init script
local function include(luafile, _print_err)
	local STAT, ERR_OR_CONTENT = pcall(require, luafile)
	if not STAT then
		return nil
	end
	return ERR_OR_CONTENT
end

-- HTML document
local HEAD = include 'mod.head'
local HEADER = include 'mod.header'
local FOOTER = include 'mod.footer'
local function doc_init(BODY, _sources)
	local src = _sources or {}
	local H = src.header or HEADER
	local A = src.aside
	local F = src.footer or FOOTER
	local htdoc = {
	'<!DOCTYPE html>',
	'<html lang="en">',
	'<head>', src.head or HEAD or '', '</head>',
	'<body onload="if (typeof(init) === \'function\') { init(); }">'
	}

	if H then
		table.insert(htdoc, '<header>'..H..'</header>')
		table.insert(htdoc, "<div class='header_padding'></div>")
	end

	if A then
		table.insert(htdoc, '<aside>'..A..'</aside>')
	end

	table.insert(htdoc, '<main>'..(BODY or '')..'</main>')

	if F then
		table.insert(htdoc, '<footer>'..F..'</footer>')
	end

	table.insert(htdoc, '</body>\n</html>')

	for _, v in ipairs(htdoc) do
		ngx.say(v)
	end
end

return doc_init
