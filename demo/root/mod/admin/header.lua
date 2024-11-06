local e = require 'env'
local conf = require 'conf'
local header = {
string.format([[
<div class='i center w' style='padding: 0px 2rem'>
	<div class='left'>
		<p class='h3'>Admin page</p>
	</div>

	<div id='a_home' class='i center' style='gap: 2rem'>
		<a href='/'>Home</a>
	</div>

	<div class='right tr'>
		<p>%s</p>
	</div>
</div>
]], e.date())
}

return header
