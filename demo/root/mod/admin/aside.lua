local conf = require 'conf'
local init = require 'init'
local e = require 'env'

local pages = {}
for item in e.file(conf.root..'/pages/list.txt'):gmatch('(admin/.-)\n') do
	if item ~= '' then
		local path = item:match('^(.-) ')
		local name = item:match('^.- [-] (.+)')
		table.insert(pages, string.format(
			"<p class='w'><a href='/%s'>%s</a></p>",
			path, name))
	end
end

return ([[
	<style>aside { height: 100vh; width: 20rem }</style>
	<div><a href='/admin'>Dashboard</a></div>
	<div class='w h3'>Pages</div>
	$1
]]):parse(table.concat(pages, '\n'))
