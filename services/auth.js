const debug = require('debug')('topik:Auth');
const config = require('./../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class Auth{

	constructor(){
		this.secret = 'MFRjUmZOWE1tWWMyQXpIS295ZW1ySmpXM3pOTUgxRDM=';
		this.saltRounds = 10;
	}

	/*
		@params - userID - id of user
		Description: generates a json web token for user
	*/
	generateToken(userID){
		if(!userID){
			return false;
		}
		return jwt.sign({ data : userID}, this.secret, { expiresIn: '2 years' }); //TO DO: connect with CA
	}

	/*
		@params - req - the http request headers/body
		Description: checks a web token to see if corrupt
	*/
	tokenIsGood(token){
		if(!token || token  > 10){
			return false;
		}

		try{
			jwt.verify(token,this.secret);
			return true;

		}catch(err){
			if(err){
				return false;	//TO DO: Block ip address if too many failed attempts
			}
		}
	}

	/*
		@params - req - request headers
		Description: gets userID from token
	*/
	getUserID(req){
		var token = req.get('Authorization');
		if(!this.tokenIsGood(token)){
			return false;
		}

		const decodedToken = jwt.decode(token);
		const userID = decodedToken.data.toString();
		if(userID)
			return userID;
		else
			return false;
	}

	/*
		@params - password - new / updated password for user
		Description: one way encryption for user password
	*/
	encrypt(password){
		return bcrypt.hashSync(password, this.saltRounds); //TO DO: switch to async
	}

	/*
		@param - password, string password for comparison
		@param - hash - encrypted password
		Description: checks a web token to see if corrupt
	*/
	passwordIsGood(password,hash){
		return bcrypt.compareSync(password, hash); //TO DO: switch to async
	}
}

module.exports = new Auth();
