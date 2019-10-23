/*	Library for storing and editing data
*/

const fs = require('fs').promises
const path = require('path')

const helpers = require('./helpers')

var lib = {
	baseDir: path.join(__dirname, '/../.data/')
}

lib.create = async (dir, file, data) => {
	try {
		const handle = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'w+')
		await handle.writeFile(JSON.stringify(data))
		await handle.close()
	} catch (error) {
		console.error(error)
	}
}

lib.read = async (dir, file) => {
	try {
		const handle = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r')
		const data = await handle.readFile('utf8')
		return helpers.parseJsonToObject(data)
	} catch (error) {
		console.error(error)
	}
}

lib.update = async (dir, file, data) => {
	try {
		const handle = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+')
		await handle.truncate()
		await handle.writeFile(JSON.stringify(data))
		await handle.close()
	} catch (error) {
		console.error(error)
	}
}

lib.delete = async (dir, file) => {
	try {
		await fs.unlink(`${lib.baseDir}${dir}/${file}.json`)
	} catch (error) {
		console.error(error)
	}
}

module.exports = lib
