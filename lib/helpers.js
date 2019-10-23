const crypto = require('crypto')
const config = require('../config')

const helpers = {}
helpers.hash = (str) => {
	let hash = false
	if (typeof str === 'string' && str.length > 0) {
		hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
	}
	return hash
}
helpers.parseJsonToObject = (str) => {
	try {
		return JSON.parse(str)
	} catch (err) {
		return {}
	}
}

module.exports = helpers
