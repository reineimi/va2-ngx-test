local init = require 'init'
local min = {}
min.style = [[
div { display: flex }
div > * { margin: auto }
]]
min.body = {[[
<p>Thinking out loud...</p>
]]}

local body = {[[
<div class='i center' style='width: 90%; height: 100%'>
	<h1 style='font-family: var(--fontCode); padding: 2rem;'>Hi there!</h1>
	<div class='bgcont' style='width: 90%; height: 80%; background-image: url("/i.webp")'></div>
</div>
]],
}

init(table.concat(body, '\n'), {
	title = 'Home',
	seo = {
		title='Homepage - Va2:CMS Demo',
		description='Va2:CMS Demo project home page. - @reineimi',
		keywords='reineimi, va2, vanilla, cms'
	},
	min = min
})
