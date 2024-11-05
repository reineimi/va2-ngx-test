local init = require 'init'
local body = {[[
<div class='i center' style='width: 90%; height: 100%'>
	<h1 style='font-family: var(--fontCode); padding: 2rem;'>Hi there!</h1>
	<div class='bgcont' style='width: 90%; height: 80%; background-image: url("/i.webp")'></div>
</div>
]],

}

init(table.concat(body, '\n'))
