
// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Handlers
const handlers = {}
handlers.ping = (data, cb) => {
	cb(200)
}
handlers.notFound = (data, cb) => {
	cb(404, {})
}
handlers.users = (data, cb) => {
	const acceptableMethods = ['post', 'get', 'put', 'delete']
	if (acceptableMethods.includes(data.method)) {
		handlers._users[data.method](data, cb)
	} else {
		cb(405)
	}
}

// User = {firstName, lastName, phone, password, tosAgreement}
const normalizeString = (str) => typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : undefined
const normalizePhone = (str) => typeof(str) === 'string' && str.trim().length > 7 ? str.trim() : undefined
const normalizeBoolean = (bool) => typeof(bool) === 'boolean' && bool === true ? true : undefined

handlers._users = {
	async post(data, cb) {
		const firstName = normalizeString(data.payload.firstName)
		const lastName = normalizeString(data.payload.lastName)
		const phone = normalizePhone(data.payload.phone)
		const password = normalizeString(data.payload.password)
		const tosAgreement = normalizeBoolean(data.payload.tosAgreement)

		const user = await _data.read('users', phone) || false
		if (user) {
			return cb(400, {'Error': 'A user with that phone number already exists'})
		}

		if (firstName && lastName && phone && password && tosAgreement) {
			const hashedPassword = helpers.hash(password)
			if (!hashedPassword) {
				return cb(500, {'Error': 'Could not hash password'})
			}

			const userObject = {
				firstName,
				lastName,
				phone,
				hashedPassword,
				tosAgreement
			}

			try {
				await _data.create('users', phone, userObject)
				cb(200, userObject)
			} catch (error) {
				console.error(error)
				cb(500, {'Error': 'Could not create user'})
			}
		} else {
			cb(400, {'Error': 'Missing required fields'})
		}
	},

	// [TODO] Reject anonymous requests
	// [TODO] Allow only access to own data
	async get(data, cb) {
		const phone = normalizePhone(data.queryStringObject.phone) || false
		if (!phone) {
			return cb(400, {'Error': 'Missing required field'})
		} else {
			const userData = await _data.read('users', phone)
			if (!userData) return cb(404)

			delete userData.hashedPassword
			cb(200, userData)
		}
	},

	// [TODO] Reject anonymous requests
	// [TODO] Allow only access to own data
	async put(data, cb) {
		const phone = normalizePhone(data.payload.phone) || false
		if (!phone) {
			return cb(400, {'Error': 'Missing required field'})
		}

		const userData = await _data.read('users', phone) || false
		if (!userData) {
			return cb(400, {'Error': 'No user with this phone number'})
		}

		const firstName = normalizeString(data.payload.firstName) || userData.firstName
		const lastName = normalizeString(data.payload.lastName) || userData.lastName
		const password = normalizeString(data.payload.password)

		if (firstName || lastName || password) {
			let hashedPassword = userData.hashedPassword
			if (password) {
				hashedPassword = helpers.hash(password)
				if (!hashedPassword) {
					return cb(500, {'Error': 'Could not hash password'})
				}
			}
			try {
				const newData = {
					...userData,
					firstName,
					lastName,
					hashedPassword
				}
				await _data.update('users', phone, newData)

				delete newData.hashedPassword
				cb(200, newData)
			} catch (error) {
				console.error(error)
				cb(500, {'Error': 'Could not update user'})
			}
		}

	},

	// [TODO] Reject anonymous requests
	// [TODO] Allow only access to own data
	async delete(data, cb) {
		const phone = normalizePhone(data.payload.phone) || false
		if (!phone) {
			return cb(400, {'Error': 'Missing required field'})
		}

		const userData = await _data.read('users', phone) || false
		if (!userData) {
			return cb(400, {'Error': 'No user with this phone number'})
		} else {
			try {
				await _data.delete('users', phone)
				cb(204)
			} catch (error) {
				console.error(error)
				cb(500, {'Error': 'Could not delete user'})
			}
		}
	}
}

module.exports = handlers
