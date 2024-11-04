local conf = require 'conf'
local init = require 'init'
local e = require 'env'

local pages = {}
for item in e.file(conf.root..'/pages/list.txt'):gmatch('(.-)\n') do
	if item ~= '' then
		local path = item:match('^(.-) ')
		local name = item:match('^.- [-] (.+)')
		table.insert(pages, string.format(
			"<p class='w'>%s</p>",
			name))
	end
end

local body = [[
	<div class='w center'>$1</div>
]]

init(body:parse(
	table.concat(pages, '\n')
), {
	header = require 'mod.admin.header',
	aside = require 'mod.admin.aside',
	footer = nil
})
