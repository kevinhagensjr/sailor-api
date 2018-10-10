'use strict';

const serverName  = process.env.NODE_NAME || 'A1';
const environment = process.env.NODE_ENV  || 'production';

let config = {
	environment : environment.toString(), //set enviornment production vs development
	cdn : '', //topik cdn for
	server : {
		name : serverName.toString()
	},
	aws : {
		accessKey : 'AKIAI3MBZAAEE4MPSQRQ',
		secretAccessKey : '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' ,
		region : 'us-east-1'
	},
	port : 3000, //api port
	mongodb : {
		url 	 : 'mongodb://127.0.0.1:27017/sailordb',
		port 	 : 27017,
		database : 'sailordb'
	},
	slack : { //configurations for slack
		username 	: 'gSailor',
		webhook 	: 'https://hooks.slack.com/services/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',
		channels    : {
			user 	 : '#new-user',
			sale 	 : '#new-sale',
			feedback : '#user-feedback',
			signup   : '#signup',
		}
	}
};

module.exports = config;
