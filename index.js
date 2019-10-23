const fs = require('fs')
const url = require('url')
const http = require('http')
const https = require('https')
const { StringDecoder } = require('string_decoder')

const config = require('./config')
const handlers = require('./lib/handlers')
const data = require('./lib/data')
const helpers = require('./lib/helpers')

const httpServer = http.createServer(function (req, res) {
	myServer(req, res)
})
httpServer.listen(config.httpPort, () => {
	console.log(`Listening on port ${config.httpPort}`)
})

const httpsServer = https.createServer({
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./cert.pem')
}, (req, res) => {
	myServer(req, res)
})
httpsServer.listen(config.httpsPort, () => {
	console.log(`Listening on port ${config.httpsPort}`)
})

const myServer = function (req, res) {
	//const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)
	const parsedUrl = url.parse(req.url, true)
	const path = parsedUrl.pathname
	const trimmedPath = path.replace(/^\/+|\/+$/g, '')
	const queryStringObject = parsedUrl.query
	const method = req.method.toLowerCase()
	const headers = req.headers

	const decoder = new StringDecoder()
	let buffer = ''
	req.on('data', (data) => {
		buffer += decoder.write(data)
	})
	req.on('end', () => {
		buffer += decoder.end()

		const handling = typeof (router[path]) !== 'undefined' ? router[path] : handlers.notFound

		const data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: helpers.parseJsonToObject(buffer)
		}

		handling(data, (statusCode, payload) => {
			statusCode = typeof (statusCode) === 'number' ? statusCode : 200
			payload = typeof (payload) === 'object' ? payload : {}

			const payloadString = JSON.stringify(payload)

			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode)
			res.end(payloadString)

			return
		})

		console.log({
			time: new Date().toISOString(),
			url: req.url,
			method: req.method.toLowerCase(),
			body_size: buffer.length
		})
	})
}

const router = {
	'/ping': handlers.ping,
	'/users': handlers.users
}
