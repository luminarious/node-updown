/*	Library for storing and editing data
*/

const fs = require('fs').promises
const path = require('path')

var lib = {
	baseDir: path.join(__dirname, '/../.data/')
}

lib.create = async function (dir, file, data) {
	const handle = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx')
	await handle.writeFile(data)
	await handle.close()
}

lib.read = async function (dir, file) {
	return await fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8')
}

lib.update = async function (dir, file, data) {
	const handle = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+')
	await handle.truncate()
	await handle.writeFile(JSON.stringify(data))
	await handle.close()
}

lib.delete = async function (dir, file) {
	await fs.unlink(`${lib.baseDir}${dir}/${file}.json`)
}

module.exports = lib