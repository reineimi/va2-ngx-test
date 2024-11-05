local links = {
	'/va2.css',
	'/va2temp.css',
	'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=search',
	'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Dancing+Script:wght@400..700&family=Inconsolata:wght@200..900&'..
	'family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Sans+JP:wght@100..900&family=Roboto+Slab:wght@100..900&family=Smooch+Sans:wght@100..900&family=VT323&display=swap',
}
local _load = {}

for _, L in ipairs(links) do
	table.insert(_load,
		'<link rel="preload" href="'..L..'" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'..
		'\n<noscript><link rel="stylesheet" href="'..L..'"></noscript>')
end

return table.concat(_load, '\n')
