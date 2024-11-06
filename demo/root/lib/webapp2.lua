-- Web application builder with templates, by @reineimi - https://github.com/reineimi
document = {
	depth = 0,
	em = {},
	parsed = {}
}

-- HTML DOM Element Parser (from Lua table)
--[[ DOM table formats:
A - Fully configurable:
	{	type='div',
		attr={id='', class='center'},
		style={width='', height=''},
		content={},
		comment=''
	}
B - Short with configurable style:
	{ 'div', '8px 4px', 'auto 5px auto 10px', "id='' class='center'", {
		backgroundColor = '#000',
		color = '#fff'
		}, {
		},
		''
	}
C - Short:
	{'div', '10px', 'auto', 'center', 'background: #000', {}, ''}
D - Minimal:
	{0, '10px', 'auto', 'center'}
]]
-- type > width,height > margin >  class/attributes > style > content > comment
function document:parse(em)
	local temp = self.parsed
	local indent = string.rep('	', self.depth)
	local tag, wh, margin, attr, style, cont, comm =
	em.type or em[1] or 'div',
	em[2],
	em[3],
	em.attr or em[4],
	em.style or em[5],
	em.content or em[6],
	em.comment or em[7]

	--[str/nil] width, height
	if type(wh)=='string' then
		local w = wh:match('([0-9]+[a-z%%]+)')
		local h = wh:match('[, ]([0-9]+[a-z%%]+)')
		wh = string.format('width: %s; height: %s; ', w, (h or w))
	else
		wh = ''
	end

	--[str/nil] margin
	local m = 'margin:'
	if type(margin)=='string' then
		for n in margin:gmatch('([0-9a-z]+)') do
			m = m..' '..n
		end
		m = m..'; '
	else
		m = ''
	end

	--[str/nil] comment
	if comm then
		table.insert(temp, string.format('%s<!-- %s -->\n', indent, comm))
	end

	--[str/nil] type (tag name)
	if type(tag)=='number' then
		tag = 'div'
	end
	table.insert(temp, string.format('%s<%s', indent, tag))

	--[arr/str/nil] attributes
	if attr then
		if type(attr)=='table' then
			for i, v in pairs(attr) do
				table.insert(temp, string.format(" %s='%s'", i, v))
			end
		elseif type(attr)=='string' then
			local class = ''
			if not attr:match('[=]') then
				class = "class='"..attr.."'"
				attr = ''
			end
			table.insert(temp, ' '..class..attr)
		end
	end

	--[arr/str/nil] style
	if style or (wh~='') or (m~='') then
		table.insert(temp, ' style="'..wh..m)
		if type(style)=='table' then
			for i, v in pairs(style) do
				table.insert(temp, string.format('%s: %s; ', uncamel(i, '-'), v))
			end
		elseif type(style)=='string' then
			table.insert(temp, style)
		end
		temp[#temp] = temp[#temp]:gsub('( )$', '')
		table.insert(temp, '"')
	end
	table.insert(temp, '>\n')

	--[arr/nil] innerHTML
	if cont and (type(cont)=='table') then
		for _, data in pairs(cont) do
			self.depth = self.depth + 1
			if type(data)=='table' then
				self:parse(data)
			else table.insert(temp, data..'\n')
			end
		end
	end

	-- TAG END
	table.insert(temp, string.format('%s</%s>\n', indent, tag))

	if self.depth > 0 then
		self.depth = self.depth - 1
	end
end

-- Parse and write the data into [index.html]
function document:write()
	self.parsed = {}
	for _, element in pairs(self.em) do
		self:parse(element)
		table.insert(self.parsed, '\n')
	end
	local f = io.open('index.html', 'w')
	f:write(table.concat(self.parsed))
	f:close()
end

-- Load DOM from [index.lua]
local index = lua_call(require, 'index') or {}
for _, v in pairs(index) do
	table.insert(document.em, v)
end
