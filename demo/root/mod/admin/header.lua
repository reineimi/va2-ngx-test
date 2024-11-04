local e = require 'env'
local conf = require 'conf'

local header = {
"<div class='i center w' style='padding: 0px 2rem'>",
	[[
	<div class='left'>
		<p class='h3'>Admin page</p>
	</div>]],

	[[
	<div class='i center' style='gap: 2rem'>
		<a href='/'>Home</a>
	</div>]],

	"<div class='right tr'>",
		string.format('<p>%s</p>', e.date()),
	"</div>",
"</div>",

}

return table.concat(header, '\n')
