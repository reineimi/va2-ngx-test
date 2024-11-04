local conf = require 'conf'
local header = {[[
<div class='i center' style='padding: 2rem 0; gap: 2rem;'>
]],

}

local list = io.open(conf.root..'/pages/list.txt')
if list then
	for item in list:lines() do
		if (item ~= '') and not item:match('/') then
			local path = item:match('^(.-) ')
			local name = item:match('^.- [-] (.+)')
			table.insert(header, string.format("<a href='/%s'>%s</a>", path, name))
		end
	end
	list:close()
end
table.insert(header, '</div>')

return table.concat(header, '\n')
