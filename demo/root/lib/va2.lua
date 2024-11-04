--	This code and all included modules are licensed
--	under VPCDP by Eimi Rein (霊音 永旻) - @reineimi
-->		https://github.com/reineimi/VPCDP
print 'V A 二ｌｌA (Va2) by @reineimi - https://github.com/reineimi/va2'
print(os.date('%B %d (%a), %H:%M - %Y/%m/%d\n'))

_ENV.va2 = {
	-- Includes
	modules = {
		'response',
		'lib.va2bash',
		'lib.va2crawl',
		'lib.va2tables'
	},
	-- Library environment
	env = {},
	-- Module environment
	mod = {},
	-- Enums
	e = {},
	-- Magic numbers
	n = {},
	-- Temporary data
	temp = {}
}

-- Library initialization
local va2_init = function()
	math.randomseed(os.time())

	-- Get current system user
	local p = io.popen('whoami')
	_G.USER = p:read('*a'):gsub('\n', '')
	p:close()

	-- Construct PATH
	local PATH = {
		'/srv/http/va2.reineimi',
		'/home/'..USER..'/Documents/va2.reineimi',
	}
	for _, path in ipairs(PATH) do
		package.path = path..'/?.lua;'..package.path
	end

	-- Include modules
	for _, M in ipairs(va2.modules) do
		local STATUS, RES = pcall(require, M)
		if STATUS then
			local M = M:match('[.](.+)')
			_G[M] = RES
			print('Module loaded: '..M)
		end
	end
	print ''
end

va2_init()
