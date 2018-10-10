const express = require('express');
const debug = require('debug')('Sailor:V1Router');
const auth = require('./../../services/auth');

class V1Router{
	constructor(api){
		this.indexController = require('./../../controllers/v1');
		this.router = new express.Router();
		this.listen(api);
	}

	listen(api){
		const self = this;
		debug('Configuring routes for verion of API');

		//initialize all routers for version 1
		const userRouter     	 = require('./user');
		const saleRouter    	 = require('./sale');
		const notifRouter 		 = require('./notification');

		//mount to api endpoints
		self.router.use('/user',userRouter);
		self.router.use('/sale',saleRouter);
		self.router.use('/notification',notifRouter);

		//check json webtoken, grant/deny acces
		self.router.use((req, res, next) => {
			const token = req.get('Authorization');
			const validPaths = ['/signup','/signin','/forgot','/beta','/signin/facebook','/web','signin/twitter'];
			if(!auth.tokenIsGood(token)){
				for(let i=0; i < validPaths.length; i++){
					if(req.path.includes(validPaths[i])){
						return next();
					}
				}
				return self.denyAccess(res);
			}
			return next();
		});

		self.router.post('/signin', (req, res) => {
			return self.indexController.signin(req, res);
    });

		self.router.post('/signin/facebook', (req, res) => {
			return self.indexController.facebookSignin(req, res);
		});

		self.router.post('/signin/twitter', (req, res) => {
			return self.indexController.twitterSignin(req, res);
		});

  	self.router.post('/signup', (req, res) => {
			return self.indexController.signup(req, res);
  	});

  	self.router.post('/signout', (req, res) => {
			return self.indexController.signout(req, res);
  	});

  	self.router.post('/forgot', (req, res) => {
			return self.indexController.forgot(req, res);
  	});

  	self.router.get('/home', (req, res) => {
			return self.indexController.feed(req, res);
  	});

  	self.router.get('/activity', (req, res) => {
			return self.indexController.activity(req, res);
  	});

  	self.router.get('/search', (req, res) => {
			return self.indexController.search(req, res);
  	});

  	self.router.post('/feedback', (req, res) => {
			return self.indexController.feedback(req, res);
  	});

		self.router.post('/beta', (req, res) => {
			return self.indexController.beta(req, res);
		});
		self.router.post('/search', (req, res) => {
			return self.indexController.search(req, res);
		});
		api.use('/v1',self.router);
	}

	//return to 4040 bad request
	denyAccess(res){
		res.status(404);
		//TO DO: Add logic for checking ip addreses, protection for DOS attacks
		return res.json({
			error : 'request invalid'
		});
	}
	getRouter(){
		return this.router;
	}
}

//export router for use v1 api calls
module.exports = (api) => {
	return new V1Router(api);
};
