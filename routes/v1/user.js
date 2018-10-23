const express = require('express');
const debug = require('debug')('Sailor:UserRouter');

class UserRouter{
	constructor(){
		this.userController = require('./../../controllers/v1/user');
		this.router = new express.Router();
		this.listen();
	}

	listen(){
		const self = this;
		this.router.get('/', (req, res) => {
			return self.userController.account(req, res);
  	});

		this.router.get('/profile/:userID', (req, res) => {
			return self.userController.profile(req, res);
  	});

		this.router.post('/update', (req, res) => {
			return self.userController.update(req, res);
  	});
		
  	this.router.post('/password/update', (req, res) => {
			return self.userController.updatePassword(req, res);
  	});

  	this.router.post('/photo/update', (req, res) => {
			return self.userController.addPhoto(req, res);
  	});

  	this.router.get('/photo/:userID', (req, res) => {
			return self.userController.photo(req, res);
  	});
	}
	getRouter(){
		return this.router;
	}
}

//export router for /user endpoint
const userRouter = new UserRouter();
module.exports = userRouter.getRouter();
