-- Simple pattern-match code highlighting
local hl = {
	lua = {},
	js = {},
	css = {},
	html = {}
}
local default = {}

hl.lua.operators = {
	'%(', '(%))[ \n]?',
	'%{', '(%})[ \n]?',
	'%[', '(%])[ \n]?',
	'%-', '%+', '%=', '%,', '%:',
	'local', 'nil', 'true', 'false',
	'function', 'end', 'return',
	'if', 'then', 'for', 'while', 'do',
	'else', 'elseif', '[ \n]?(break)',
}
hl.lua.numbers = {'[%d]+'}
hl.lua.vars = {
	'_ENV', '_G', 'io', 'os', 'require', 'package',
	'pairs', 'ipairs', 'type', 'coroutine', 'math',
	'.path',
}
hl.lua.funcs = {
	'%:(sub)[%(]?', '%:(gsub)[%(]?',
	'%:(write)[%(]?', '%:(read)[%(]?', '%:(close)[%(]?',
	'print', 
}
hl.lua.strings = { [[(["'].-['"])]], '(%[%[.-%]%])' }
hl.lua.comments = { '(%-%-.-)\n', '(%-%-%[%[.-%]%])' }

-- Automation stuff
for lang in pairs(hl) do
	for regset in pairs(hl[lang]) do
		-- Correct the single-word patterns
		for type, reg in ipairs(hl[lang][regset]) do
			if reg:match('^[%a]+') and (not reg:match('%]%?')) then
				print(reg)
				hl[lang][regset][type] = '[\n 	]('..reg..')[%)]?'
			end
		end
		-- Generate default color tags
		default[regset] = '<'..regset:match('[%a]')..'>'
	end
end

function hl.parse(lang, str)
	str = str:gsub('%%', ' _percent_pattern_symbol_ ')
	print '------------------'

	for regset in pairs(hl[lang]) do
		for _, reg in ipairs(hl[lang][regset]) do
			local tag = default[regset]
			local tagx = tag:gsub('<', '</')
			for i in str:gmatch(reg) do
				if not str:match(tag..reg..tagx) then
					print('	'..reg..'		'..tag..i..tagx)
					str = str:gsub(reg, tag..i..tagx)
				end
			end
		end
	end

	str = str:gsub(' _percent_pattern_symbol_ ', '%%')
	return str:gsub('\n', '<br>'):gsub('[	]', '<tab></tab>')
end

va2code = hl
return hl
