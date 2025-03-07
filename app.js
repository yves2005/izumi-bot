const client = require('./lib/client')

require("./update.js");



const connect = async () => {

	try {

		await client.initialize()

	} catch (error) {

		console.error(error)

	}

}



connect()
