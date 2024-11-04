-- Core utility script by @reineimi - https://github.com/reineimi
-- Function arguments starting with:
--	_ (_arg) are optional
--	__ (__arg) should be ignored (only used from within the function)
-- Functions starting with _ (e._func) are recursions used for wrapping and shoud be ignored

local e = { info = {} }
local I = e.info
local __def = 'Modifications to standard library'

-- Top level: any --
I.sh = 'Execute system shell command, return output'
function e.sh(command)
	local p = io.popen(command)
	local out = p:read('*a')
	p:close()
	return out
end

I.os = 'Current operating system'
if os.getenv('PATH') then
	if os.getenv('PATH'):match('C:\\') then
		e.os = 'Windows'
	elseif os.getenv('PATH'):match('/usr/local/bin') then
		e.os = 'Unix'
	elseif os.getenv('PATH'):match('/com.') then
		e.os = 'Android'
	else
		e.os = 'Unix? (Unknown)'
	end
end

I.cwd = 'Current working directory'
if e.os == 'Windows' then
	e.cwd = e.sh('echo %cd%'):gsub('\n', '')
else
	e.cwd = e.sh('pwd'):gsub('\n', '')
end

I.file = 'Get file content and append to/overwrite it'
function e.file(filepath, _append_content, _will_overwrite)
	local data, newdata = {}, _append_content or ''
	if not _append_content then
		local f = io.open(filepath, 'r')
		if f then
			for line in f:lines() do
				table.insert(data, line)
			end
			f:close()
			return table.concat(data, '\n')..'\n'
		end

	elseif not _will_overwrite then
		local f = io.open(filepath, 'a')
		f:write(newdata)
		f:close()

	else
		local f = io.open(filepath, 'w')
		f:write(newdata)
		f:close()
	end
end


-- Variables --
I.temp = 'Storage for temporary data. There will be no information about its contents'
e.temp = {}

I.num = 'Storage for "magic numbers" (0 = arg)'
e.num = {}

I.enum = 'Storage for enumerated data (arg = 0)'
e.enum = {}

I.sess = 'Information about current session/instance of the script'
e.sess = {}

I['sess.start'] = 'Time at which the session has started'
e.sess.start = os.time()


-- Global --
math.randomseed(os.time())

print = function(...)
	local data = {...}
	for _, v in ipairs(data) do
		io.write(tostring(v)..'\n')
		if e.log then e.log(2, tostring(v)) end
	end
end

I.table = __def

I['table.concat'] = 'Same but with optional index range as 2 last args'
local table_concat = table.concat
function table.concat(t, sep, indStart, indEnd)
	local range = {}
	if not indStart then
		return table_concat(t, sep)
	else
		for i = indStart, (indEnd or #t) do
			table.insert(range, t[i])
		end
		return table_concat(range, sep)
	end
end

I['table.push'] = 'Push value into index while offsetting it by 1'
function table.push(t, value, index)
	local index = index or 1
	if t[index] then
		if type(index)=='number' then
			for i = -#t, -index do
				local i = math.abs(i)
				t[i+1] = t[i]
			end
		end
		t[index] = value
	end
end

I['table.put'] = 'The table.insert() with unlimited arguments'
function table.put(t, ...)
	local data = {...}
	for _, v in ipairs(data) do
		table.insert(t, v)
	end
end

I['table.add'] = 'Add pairs to table A from table B'
function table.add(t1, t2)
	for i, v in pairs(t2) do
		if not t1[i] then
			t1[i] = v
		else
			if type(v)=='string' then
				t1[i] = t1[i] .. v
			elseif type(v)=='number' then
				t1[i] = t1[i] + v
			elseif type(v)=='table' then
				if type(t1[i])=='table' then
					table.add(t1[i], v)
				else
					table.push(v, t1[i], 1)
					t1[i] = v
				end
			else
				t1[i] = v
			end
		end
	end
end

I['table.merge'] = 'Merge indexes A with B while removing the latter'
function table.merge(t, i1, i2)
	if t[i1] and t[i2] then
		if type(t[i1])=='string' then
			t[i1] = t[i1] .. t[i2]
		elseif type(t[i1])=='number' then
			t[i1] = t[i1] + t[i2]
		elseif type(t[i1])=='table' then
			if type(t[i2])=='table' then
				table.add(t[i1], t[i2])
			else
				table.insert(t[i1], t[i2])
			end
		elseif type(t[i1])=='function' then
			if type(t[i2])=='function' then
				fmerge(t[i1], t[i2])
			else
				t[i1](t[i2])
			end
		else
			t[i1] = t[i2]
		end
		table.remove(t, i2)
	end
end

I['table.print'] = 'Recursively print a table and return as string'
table.printDepth = 0
table.printData = {}
function table.print(t, name)
	local n = name or 'self'
	local indent = string.rep('  ', table.printDepth)

	if type(n)=='string' then
		table.insert(table.printData, string.format('%s%s = {', indent, n))
	elseif type(n)=='number' then
		table.insert(table.printData, string.format('%s[%s] = {', indent, n))
	end

	if type(t)=='table' then
		table.printDepth = table.printDepth + 1
		local indent = string.rep('  ', table.printDepth)

		for i, v in pairs(t) do
			local ind = i
			if type(i)=='number' then
				ind = '['..i..']'
			end

			if type(v)=='table' then
				table.print(v, i)
			elseif type(v)=='string' then
				table.insert(table.printData, string.format('%s%s = "%s",', indent, ind, v))
			else
				table.insert(table.printData, string.format('%s%s = %s,', indent, ind, v))
			end
		end

	end

	if table.printDepth > 0 then
		table.printDepth = table.printDepth - 1
	end

	table.insert(table.printData, string.rep('  ', table.printDepth)..'},')
	if table.printDepth == 0 then
		local data = table.concat(table.printData, '\n')
		table.printData = {}
		print(data:sub(0, #data-1))
		table.printDepth = 0
		table.printData = {}
		return data:sub(0, #data-1)
	end
end

I['table.find'] = 'Search for a value and return {path, i, v} pairs'
table.findPath = ''
table.findData = {}
function table.find(t, value)
	if table.findPath == '' then
		table.findData = {}
	end
	for i, v in pairs(t) do
		if v == value then
			table.findPath = table.findPath..'.'..i
			table.findData = { path=table.findPath, i=i, v=v }
			table.findPath = ''
		elseif type(v) == 'table' then
			table.findPath = table.findPath..'.'..i
			table.find(v, value)
		else
			table.findPath = ''
			table.findData = {}
		end
	end
	return table.findData
end

I.string = __def

I['string:parse'] = 'Parse provided args in the string, like this:  "Hello, $1"'
function string:parse(...)
	local data = {...}
	for i in self:gmatch('$([%d]+)') do
		self = self:gsub('$[%d]+', tostring(data[tonumber(i)]))
	end
	return self
end

I.math = __def

I['math.pol'] = 'Polarity (0, 1 or -1) of the number compared to other or 0'
function math.pol(val, num, range)
	local v = val or 0
	local n = num or 0
	local r = range or 0

	if v > (n+r) then
		v = 1
	elseif v < (n-r) then
		v = -1
	else
		v = 0
	end

	return v
end


-- Function variables --
I['num.log'] = 'Log function levels -> log(level or arg, ...)'
e.num.log = {'STDOUT', 'INFO', 'WARN', 'ERROR'}


-- Functions --
I.help = 'Get information about anything in [env.lua]'
function e.help(item)
	if item then
		local i = e.info[item]
		print(i)
		return i
	else
		local items = {}
		for i,v in pairs(e.info) do
			table.insert(items, i..' - '..v)
		end
		items = table.concat(items, '\n')
		print(items)
		return items
	end
end

I.date = 'Formatted current date'
function e.date()
	return os.date('%b %d (%a), %H:%M - %Y/%m/%d')
end

I.time = 'Formatted current time'
function e.time()
	return os.date('%X')
end

I['sess.pass']  = 'Time passed since session start'
function e.sess.pass(separator)
	local t = (os.time() - e.sess.start)
	local sep = separator or ' '
	local s = math.floor(t % 60)
	local m = math.floor((t/60) % 60)
	local h = math.floor(((t/60) / 60) % 24)
	local d = math.floor(((t/60) / 60 / 24) % 24)
	return string.format('%dd%s%dh%s%dm%s%ds', d, sep, h, sep, m, sep, s)
end

I.stdin = 'Read (and optionally log) user input'
e.stdin = function()
	local input = io.read()
	if e.log then e.log(1, input) end
	return input
end

I.stdout = 'Print (and optionally log) anything, including tables'
e.stdout = function(...)
	local data = {...}
	for _, v in ipairs(data) do
		if type(v) == 'table' then
			v = table.print(v)
		else
			v = tostring(v)
			io.write('> '..v..'\n')
		end
		if e.log then e.log(2, v) end
	end
end

I.put = 'nginx: Paste HTML code'
function e.put(...)
	local data = {...}
	for _, str in ipairs(data) do
		if str then
			ngx.say(tostring(str))
		end
	end
end

I.include = 'require() without error if no module found'
function e.include(luafile, _return_err)
	local STAT, ERR_OR_CONTENT = pcall(require, luafile)
	if not STAT then
		if _return_err then
			return '<pre>\n'..tostring(ERR_OR_CONTENT)..'\n</pre>'
		end
		return nil
	end
	return ERR_OR_CONTENT
end

I.uid = 'Generate a random unique ID'
function e.uid(prefix, length)
	local _len = length or 12
	local _min = tonumber('0x1'..string.rep('0', _len-1))
	local _max = tonumber('0x'..string.rep('F', _len))
	local _pref = ''
	if prefix then _pref = prefix..'_' end
	return string.format('%s%0'.._len..'x', _pref, math.random(_min, _max))
end

I.torgb = 'Convert hexadecimal color to rgb'
function e.torgb(str)
	local rgb, dots = {}, '.'

	if str:len() >= 6 then dots = '..' end
	for n in str:gmatch(dots) do
		if n:len()==1 then n = n..n end
		table.insert(rgb, tonumber( tostring(tonumber('0x'..n)):sub(1, 4) ))
	end

	return rgb[1], rgb[2], rgb[3], rgb[4] or 255
end

I.log = 'Simple logger, log("help") for more information'
e.temp.log = {}
function e.log(arg, ...)
	local arg = arg or 2
	local data = {...}
	local ms = tostring(os.clock()):match('[.](%d+)')

	if (type(arg)=='number') and (arg <= #e.num.log) then
		for _, v in ipairs(data) do
			table.insert(e.temp.log, string.format('[%s:%s][%s]: %s', os.date('%H:%M:%S'), ms, e.num.log[arg], v))
		end
	end

	if arg=='save' then
		local f = io.open('log_'..os.date('%Y-%m-%d_%H%M%S')..'.txt', 'w')
		f:write(table.concat(e.temp.log, '\n'))
		f:close()
	end

	if arg=='print' then
		print(table.concat(e.temp.log, '\n'))
	end

	if arg=='clear' then
		e.temp.log = {}
	end
end

I.json = 'Convert JSON string to Lua table'
e.temp.json = {}
function e._json(jstr, __subtable)
	local out = __subtable or e.temp.json
	local __obj, __arr, __num, __str =
		'"[%a%d%p]+":[ ]?%{.-%}',
		'"[%a%d%p]+":[ ]?%[.-%]',
		'"[%a%d_.]-":[ ]?[%d.]+',
		'(".-":[ ]?".-")[, }$\n]'

	-- Cut out objects
	for obj in jstr:gmatch(__obj) do
		jstr = jstr:gsub(__obj, '')
		local i = obj:match('^"(.-)"')
		local v = obj:match('^.-(%{.+%})$')
		out[i] = {}
		e._json(v, out[i])
	end

	-- Cut out arrays
	for arr in jstr:gmatch(__arr) do
		jstr = jstr:gsub(__arr, '')
		local i = arr:match('^"(.-)"')
		local v = arr:match('^.-(%[.+%])$')
		out[i] = {}
		e._json(v, out[i])
	end

	-- Cut out numbers
	for num in jstr:gmatch(__num) do
		jstr = jstr:gsub(__num, '')
		local i = num:match('^"(.-)"')
		local v = num:match('([%d.]+)$')
		out[i] = tonumber(v)
	end

	-- Cut out strings
	for str in jstr:gmatch(__str) do
		jstr = jstr:gsub(__str, '')
		local i = str:match('^"(.-)"')
		str = str:gsub('^"(.-)"', '')
		local v = str:match('"(.-)"$')
		out[i] = v
	end

	-- Get indexed strings and numbers
	for istr in jstr:gmatch('"(.-)"[, }%]]') do
		table.insert(out, istr)
	end
	for inum in jstr:gmatch('[%d.]+') do
		table.insert(out, tonumber(inum))
	end

	return e.temp.json
end
function e.json(json_str)
	local t = e._json(json_str)
	e.temp.json = {}
	return t
end

I.tojson = 'Convert Lua table to JSON string'
function e.tojson(t)
	local rawJson, isArray = {}, false

	for i, v in pairs(t) do
		if type(v) ~= 'table' then
			if #t > 0 then --isArray
				table.insert(rawJson, string.format('"%s"', tostring(v)))
				isArray = true
			else --isObject
				table.insert(rawJson, string.format('"%s":"%s"', i, tostring(v)))
			end

		else
			local json_t, isSubArray = {}, false
			if #v > 0 then --isSubArray
				isSubArray = true
				for i2, v2 in pairs(v) do
					table.insert(json_t, string.format('"%s"', tostring(v2)))
				end
			else --isSubObject
				isSubArray = false
				for i2, v2 in pairs(v) do
					table.insert(json_t, string.format('"%s":"%s"', i2, tostring(v2)))
				end
			end

			if #t > 0 then --isArray
				if isSubArray then
					table.insert(rawJson, string.format('[%s]', table.concat(json_t, ',')))
				else table.insert(rawJson, string.format('{%s}', table.concat(json_t, ',')))
				end
			else --isObject
				if isSubArray then
					table.insert(rawJson, string.format('"%s": [%s]', i, table.concat(json_t, ',')))
				else table.insert(rawJson, string.format('"%s": {%s}', i, table.concat(json_t, ',')))
				end
			end
		end
	end

	if isArray then
		return '['..table.concat(rawJson, ','):gsub('\n', '')..']'
	else return '{'..table.concat(rawJson, ','):gsub('\n', '')..'}'
	end
end


return e
