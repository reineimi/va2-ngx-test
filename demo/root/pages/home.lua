local init = require 'init'
local body = {[[
<div class='i center' style='width: 90%; height: 100%'>
	<h1 style='font-family: var(--fontCode); padding: 2rem;'>Hi there!</h1>
	<img src='/i.webp' alt='' class='w'>
</div>
]],

}

init(table.concat(body, '\n'))
