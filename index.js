const fs = require('fs')
const http = require('http')
const https = require('https')
const { StringDecoder } = require('string_decoder')
const config = require('./config')

const httpServer = http.createServer(function (req, res) {
	myServer(req, res)
})
httpServer.listen(config.httpPort, () => {
	console.log(`Listening on port ${config.httpPort}`)
})

const httpsServer = https.createServer({
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./cert.pem')
}, function (req, res) {
	myServer(req, res)
})
httpsServer.listen(config.httpsPort, () => {
	console.log(`Listening on port ${config.httpsPort}`)
})

const myServer = function (req, res) {
	const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)

	const decoder = new StringDecoder()
	let buffer = ''
	req.on('data', (data) => {
		buffer += decoder.write(data)
	})
	req.on('end', () => {
		buffer += decoder.end()

		const handling = typeof (router[parsedUrl.pathname]) !== 'undefined' ? router[parsedUrl.pathname] : handlers.notFound

		handling({}, (statusCode, payload) => {
			statusCode = typeof (statusCode) === 'number' ? statusCode : 200
			payload = typeof (payload) === 'object' ? payload : {}

			const payloadString = JSON.stringify(payload)

			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode)
			res.end(payloadString)
		})

		console.log({
			time: new Date().toISOString(),
			url: req.url,
			method: req.method.toLowerCase(),
			body_size: buffer.length
		})
	})
}

const handlers = {}
handlers.hello = function (data, cb) {
	cb(200, {
		msg: 'World'
	})
}
handlers.ping = function (data, cb) {
	cb(200)
}
handlers.sample = function (data, cb) {
	cb(406, {
		name: 'Sample handler'
	})
}
handlers.notFound = function (data, cb) {
	cb(404, {})
}

const router = {
	'/sample': handlers.sample,
	'/hello': handlers.hello,
	'/ping': handlers.ping
}