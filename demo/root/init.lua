local conf = require 'conf'

-- This is page init script
local function include(luafile, _print_err)
	local STAT, RES = pcall(require, luafile)
	if not STAT then
		if _print_err then ngx.say('<pre>'..RES..'</pre>') end
		return false
	end
	return RES
end

-- HTML document
local def = { -- default
	title = 'Va2:CMS Demo',
	seo = { title='', description='', keywords='', other='' },
	head = include('mod.head') or '',
	onload = include('mod.onload') or { links={}, scripts={} },
	min = include('mod.min') or { style='', body=nil },
	header = include 'mod.header',
	aside = include 'mod.aside',
	footer = include 'mod.footer'
}

local function doc_init(BODY, _SRC)
	local htdoc, src = {'<!DOCTYPE html>'}, {}
	local ins = function(str, ...)
		table.insert(htdoc, string.format(str, ...))
	end

	for i,v in pairs(def) do
		if (type(_SRC)=='table') and _SRC[i] then
			if type(_SRC[i])=='table' and (#v > 0) then
				src[i] = table.concat(_SRC[i], '\n')
			else
				src[i] = _SRC[i] or def[i]
			end
		else
			if (type(v)=='table') and (#v > 0) then
				src[i] = table.concat(v, '\n')
			else
				src[i] = v
			end
		end
	end

	-- Language
	ins('<html lang="%s">', conf.lang or 'en')

	-- Head
	ins([[<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, viewport-fit=cover">
	<title>%s</title>
	<meta name="title" content="%s">
	<meta name="description" content="%s">
	<meta name="keywords" content="%s">
	%s
	<style id="page_style_min">
	body {width:100vw; height:100vh; margin:0px; background:#777}
	#page_content_min {z-index: -999; position: absolute; width:100%%; height:100%%; display:flex; flex-wrap:wrap; font-size:16px}
	#page_content_min > * {margin: auto}
	#page_content_wrap {display: none}
	%s
	</style>
	<!-- Other -->
	%s
	<!-- Onload -->]],
	src.title, src.seo.title or '', src.seo.description or '', src.seo.keywords or '',
	src.seo.other or '', src.min.style or '', src.head)

	-- Event: window.onload
	local links = {}
	local scripts = {}
	for _, l in ipairs(src.onload.links) do
		table.insert(links, string.format([[
		<link rel="preload" href="%s" as="style" onload="this.onload=null;this.rel='stylesheet'">
		<noscript><link rel="stylesheet" href="%s"></noscript>
		]], l, l))
	end
	for _, s in ipairs(src.onload.scripts) do
		table.insert(scripts, '<script src="'..s..'" crossorigin="anonymous" async defer></script>')
	end
	ins([[
	<script id="__preload">
	window.onload = ()=>{
		document.head.insertAdjacentHTML("beforeend", `%s`);
		if (typeof(init) === "function") { init(); }
		return document.getElementById("__preload").remove();
	}
	</script>
	%s]], table.concat(links, ''), table.concat(scripts, '\n'))

	-- Body
	ins('</head>\n<body>')

	-- Minimal content
	if src.min.body then
		local _min = src.min.body
		if type(_min)=='table' then
			_min = table.concat(_min, '\n')
		end
		ins('<div id="page_content_min">%s</div>', _min)
	end

	-- Body content wrap
	ins('<div id="page_content_wrap">')

	-- Header
	if src.header then
		ins('<header>'..src.header..'</header>')
	end

	-- Side navigation (<aside>)
	ins('<main>')
	if src.aside then
		ins('<aside>'..src.aside..'</aside>')
	end

	-- Main content
	ins('%s\n</main>', BODY or '')

	-- Footer
	if src.footer then
		ins('<footer>'..src.footer..'</footer>')
	end
	ins('</div></body>\n</html>')

	for _, v in ipairs(htdoc) do
		ngx.say(v)
	end
end

return doc_init
