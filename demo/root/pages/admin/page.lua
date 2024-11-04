local conf = require 'conf'
local init = require 'init'
local e = require 'env'
local body = [[
<section style='flex: 1'>
	
</section>
]]

init(body, {
	header = require 'mod.admin.header',
	aside = require 'mod.admin.aside',
	footer = nil
})
