const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('Sailor:Server');
const cluster = require('cluster');
const config = require('./config');
let database = require('./services/database');
const cors = require('cors');

class SailorAPI{

	constructor() {
		debug("API initializing, server name: " + config.server.name);
		this.running = false;
	//	try{
			debug("Setting up express configurations");
			//initialize express
			this.api = express();
			this.api.use(bodyParser.urlencoded({ extended:false }))
			this.api.use(bodyParser.json());
			this.api.use(cors({
				origin : true,
				methods : ['POST','GET', 'PUT']
			}));

			debug("Setting up router configurations");

			//initialize router
			this.routes = require('./routes')(this.api);

	/*	}catch(e){
			debug("Failed to initialize API, " + e);
		} */
	}

	start(){
		//listen for api calls
		this.api.listen(config.port, function () {
			debug('API ready. Listening for api calls on port ' + config.port);
			this.running = true;
		});
	}
}

database.connect((db) => {
	if(!db){
		debug('Failed to start api, cant connect to database');
		return false;
	}

	//create db module
	database.db = db;
	debug('Successfully connected to mongo db..loading API');

	//start topik api
	const sailorAPI = new SailorAPI();
	sailorAPI.start();
});
