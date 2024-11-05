-- Response to POST/GET request
local conf = require 'conf'
local e = require 'env'
local arg, json, task = {}, {}, {}
local POST, err = ngx.req.get_body_data()
if POST then
	arg = e.json(POST)
	-- e.put(POST)
else
	json.err = 'Failed to get POST request arguments: '..err
end

-- List of available tasks to perform

function task.ping()
	local out = ''
	if arg.v then out = ': '..tostring(arg.v) end
	json.stdout = 'Request received'..out
end

function task.sh()
	if arg.v then json.stdout = e.sh(arg.v) end
end

-- Response logic

if arg.task and task[arg.task] then
	task[arg.task]()
end

e.put(e.tojson(json))
