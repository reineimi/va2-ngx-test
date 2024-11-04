-- Bash utils by @reineimi [https://github.com/reineimi]
if not va2 then va2 = {mod={}, e={}} end
va2.mod.echo = {}

-- Get HTML document from URL
function curl(url, _follow_redir)
	local L = ''
	if _follow_redir then L = 'L' end
	local p = io.popen(string.format('curl -s%s %s', L, url))
	local out = p:read('*a')
	p:close()
	return out
end

-- Styled bash stdout (echo -e) ...
va2.mod.echo.prefix = '> '
va2.mod.echo.padding = '  '
va2.e.echo = {
	-- Style
	normal = 0,
	bold = 1, b = 1,
	dark = 2,
	italic = 3, i = 3,
	underline = 4, u = 4,
	blink = 5,
	blinkDark = 6,
	invert = 7,
	empty = 8,
	strike = 9, s = 9,

	-- Color
	black = 30,
	darkred = 31,
	darkgreen = 32,
	brown = 33,
	darkblue = 34,
	darkpurple = 35,
	darkcyan = 36,
	lightgrey = 37,

	grey = 90,
	red = 91,
	green = 92,
	yellow = 93,
	blue = 94,
	purple = 95,
	cyan = 96,
	white = 97,

	-- Background color
	blackBg = 40,
	darkredBg = 41,
	darkgreenBg = 42,
	brownBg = 43,
	darkblueBg = 44,
	darkpurpleBg = 45,
	darkcyanBg = 46,
	lightgreyBg = 47,

	greyBg = 100,
	redBg = 101,
	greenBg = 102,
	yellowBg = 103,
	blueBg = 104,
	purpleBg = 105,
	cyanBg = 106,
	whiteBg = 107
}

--... >> echo('Hello #green;#u;world;!')
function echo(...)
	local pref = va2.mod.echo.prefix or ''
	local pad = va2.mod.echo.padding or false
	local inputs, stringset, output = {...}, {}, ''

	for _, str in ipairs(inputs) do
		for pattern in str:gmatch('#[%a]+;') do
			local id = pattern:match('[%a]+')
			str = str:gsub(pattern, '\\e['..va2.e.echo[id]..'m')
		end
		local str = str:gsub(';', '\\e[0m'):gsub('"', '\\"')
		table.insert(stringset, str)
	end
	output = table.concat(stringset, '\n')
	if pad then output = output:gsub('\n', '\n'..pad) end

	return os.execute('echo -e "'..pref..output..'"')
end

--... More precise echo. >> echoF({'Hello'}, {'world', 'green','u'}, {'!'})
function echoF(...)
	local pref = va2.mod.echo.prefix or ''
	local pad = va2.mod.echo.padding or false
	local inputs, strings = {...}, {}

	for _, strdata in ipairs(inputs) do
		local _formats = {}
		local str = tostring(strdata[1]):gsub('"', '\\"')
		if pad then str = str:gsub('\n', '\n'..pad) end

		-- Find by key or value
		for i, v in pairs(va2.e.echo) do
			for n = 2, 4 do
				local arg = strdata[n]
				if arg and ((arg == i) or (arg == v)) then
					table.insert(_formats, v)
				end
			end
		end

		table.insert(strings, string.format(
			'\\e[0;%sm%s\\e[0m',
			table.concat(_formats, ';'), str
		))
	end

	os.execute('echo -e "'..pref..table.concat(strings, ' ')..'"')
end
