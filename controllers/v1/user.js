const debug = require('debug')('Sailor:UserController');
const config = require('./../../config');
const auth = require('./../../services/auth');

class UserController{
	constructor(){
		this.userModel = require('./../../models/user');
		this.saleModel = require('./../../models/sale');
	}

	async profile(req,res){
		const userID = auth.getUserID(req);
		const accountID = req.params.accountID;

		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}
		if(!accountID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

		let profile = await this.userModel.getUser(accountID);
		if(!profile){
			return res.json({
				success : false,
				error   : 'Could not find user'
			});
		}

		profile.sales = [];
		let sales = await this.saleModel.getUserSales(accountID.toString());
		if(sales){
			profile.sales = sales;
		}

		return res.json(profile);
	}


	async account(req,res){
		const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

		const user = await this.userModel.getUser(userID);
		if(!user){
			return res.json({
				success : false,
				error   : 'Could not get user information'
			});
		}

		res.json(user);
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: Update the user account info
	*/
	async update(req,res){
		const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

		let userObject = {};
		const username = req.body.username;
		const email    = req.body.email;

		const currentUsername = await this.userModel.getUsername(userID);

		//check to see if user changed username
		if(currentUsername != username){
			//check to see if new username is taken
			const usernameExists = await this.userModel.usernameExists(username);
			if(usernameExists){
				return res.json({
					success : false,
					error	: 'Username is already taken'
				});
			}

			//add new username
			userObject.username = username.toLowerCase();;
		}

		const currentEmail = await this.userModel.getEmail(userID);

		//check to see if email has changed
		if(currentEmail != email){
			const emailExists = await this.userModel.emailExists(email);
			if(emailExists){
				return res.json({
					success : false,
					error	: 'Email address is already taken'
				});
			}

			//add new email
			userObject.email = email.toLowerCase();
		}

		//update the users account
		const updateSuccessful = await this.userModel.update(userID,userObject);

		if(!updateSuccessful){
			return res.json({
				success : false,
				error	: 'Failed to update your account'
			});
		}

		return res.json({
			success : true,
			username : username
		});
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: Change the users password
	*/
	async updatePassword(req,res){

		const userID = auth.getUserID(req);
		const oldPassword = req.body.old;
		const newPassword = req.body.new;

		if(!userID){
			return res.json({
				success : false,
				error   : 'account is invalid'
			});
		}

		if(!oldPassword || !newPassword){
			return res.json({
				success : false,
				error   : 'password must be at least 5 character'
			});
		}

		if(!newPassword.length > 5 && !oldPassword.length > 5){
			return res.json({
				success : false,
				error   : 'Password must be at least 5 characters'
			});
		}

		//get current password
		const hash = await this.userModel.getPassword(userID);
		if(!hash){
			debug('PASSWORD: ' + oldPassword + ' HASH: ' + hash);
			return res.json({
				success : false,
				error   : 'old password is incorrect'
			});
		}

		//check is password is good
		if(!auth.passwordIsGood(oldPassword,hash)){
			return res.json({
				success : false,
				error   : 'old password is incorrect'
			});
		}

		//encrypt new password
		const encryptedPassword = auth.encrypt(newPassword.toString());

		//save new password
		const updateSuccessful = await this.userModel.update(userID,{
			password : encryptedPassword
		});

		if(!updateSuccessful){
			return res.json({
				success : false,
				error   : 'Failed to update password'
			});
		}

		return res.json({
			success : true
		});
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: User has added a new profile picture
	*/
	async addPhoto(req,res){

		const userID = auth.getUserID(req);
		const photo = req.body.photo;

		if(!userID){
			return res.json({
				success : false,
				error   : 'User id is invalid'
			});
		}

		//make sure photo path is uploaded
		if(!photo.includes('.jpg')){
			return res.json({
				success : false,
				error   : 'Photo does not exist'
			});
		}

		const photoURL = config.cdn + photo;
		const updateSuccessful = await this.userModel.update(userID,{
			photo : photoURL
		});

		if(!updateSuccessful){
			return res.json({
				success : false,
				error   : 'Failed to add new photo'
			});
		}

		return res.json({
			success : true
		});
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: get the photo url for a user
	*/
	async photo(req,res){

		const userID = auth.getUserID(req);
		const userIDForPhoto = req.params.userID;

		if(!userID && !userIDForPhoto){
			return res.json({
				success : false,
				error   : 'User id is invalid'
			});
		}

		//get photo for userID
		const url = await this.userModel.getPhoto(userIDForPhoto);

		if(!url){
			return res.json({
				success : false,
				error   : 'Could not get user photo'
			});
		}

		return res.json({
			photo : url
		});
	}

}

module.exports = new UserController();
