-- By @reineimi - github.com/reineimi

local function htmltable(filepath, _print)
	local file = io.open(filepath, 'r')
	local filedata, data, rows, cols, cells = {}, {}, 0, 0, {}
	local th, td = '<th.->(.-)</th>', '<td.->(.-)</td>'

	-- Retrieve data
	for line in file:lines() do
		table.insert(filedata, line)
	end
	file:close()
	filedata = table.concat(filedata, '\n')

	-- Get rows
	for tr in filedata:gmatch('<tr.->(.-)</tr>') do
		rows = rows + 1

		-- Get cols + th + cell(s)
		for th in tr:gmatch(th) do
			cols = cols + 1
			table.insert(cells, th)
		end

		-- Get td + cell(s)
		for td in tr:gmatch(td) do
			table.insert(cells, td)
		end
	end

	-- Parse data
	for col = 1, cols do
		local n, dt = 0, nil
		if _print then
			print('-- col '..col..' --')
		end

		for row = col, #cells, cols do
			n = n + 1

			-- Assign th:{...td} pairs for data{}
			if n == 1 then
				local ind = col
				if cells[row] ~= '' then
					ind = cells[row]
				end
				data[ind] = {}
				dt = data[ind]
				if _print then
					print('[Header]: '..cells[row])
				end
			else
				table.insert(dt, cells[row])
				if _print then
					print('[Row_'..(n-1)..']: '..cells[row])
				end
			end
		end

		if _print then print '' end
	end

	print(string.format('Total: %s cols, %s rows, %s cells', cols, rows, #cells))
	return data
end

return htmltable
