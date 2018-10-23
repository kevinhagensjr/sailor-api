const {db} = require('./../services/database');
const {ObjectID} = require('mongodb');
const {promisify} = require('util');
const debug = require('debug')('Sailor:UserModel');
const config = require('./../config');
//const redis = require('./../services/redis');

class UserModel{
 constructor(){
   this.prefix = 'user';
   this.collection = db.collection(this.prefix);

   //redis commands as cache functions
  /* this.getKeyFromCache = promisify(redis.hget).bind(redis);
   this.setKeyToCache = promisify(redis.hset).bind(redis);
   this.getCache = promisify(redis.get).bind(redis);
   this.setCache = promisify(redis.set).bind(redis);
 //	this.getHash = promisify(redis.hgetall).bind(redis);; */
 }

 /*
   @params - userObject - user account info
   Description: adds new user to database
 */
 async setUser(userObject){
   if(!userObject){
     return false;
   }

   userObject.username = userObject.username.toLowerCase();
   userObject.email = userObject.email.toLowerCase();

   try{
     await this.collection.insertOne(userObject);
     return true;
   }catch(e){
     debug('ERROR, failed to add user, ' + e);
     return false;
   }
 }
 /*
   @params - userID - id of user for updating
   @params - userObject - user account info
   Description: update user account info
 */
 async update(userID,userObject){
   if(!userObject){
     debug('ERROR, failed to update user, userObject null');
     return false;
   }

   try{
     await this.collection
     .updateOne({ _id : new ObjectID(userID) },{ $set : userObject }, {upsert: true});
     return true;

   }catch(e){
     debug('ERROR, failed to update user, ' + e);
     return false;
   }
 }

 async getUserID(email){
   if(!email){
     return false;
   }

   try{
     const result = await this.collection
     .find({'email' : email.toLowerCase()})
     .project({ _id : 1 })
     .toArray();

     if(result.length == 0){
       return false;
     }

     return result[0]._id;

   }catch(e){
     debug('ERROR, failed to get user id, ' + e);
     return false;
   }
 }

 /*
   @params - userID - id of user for query
   Description: get user info
 */
 async getUser(userID){
   if(!userID){
     return false;
   }

   try{
     const key = this.prefix + '_' + userID;
     let user = false;//await this.getCache(key);
     if(user && user.length > 0){
       return JSON.parse(user);
     }

     const result = await this.collection
     .find({ _id : new ObjectID(userID.toString()) })
     .project({password : 0, devices : 0})
     .toArray();

     if(result.length == 0){
       return false;
     }
     user = result[0];
     if(user.address){
       user.address.addressString = this.getFormattedAddress(user.address);
     }
     //await this.setCache(key,JSON.stringify(user));
     return user;

   }catch(e){
     debug('ERROR, failed to get user, ' + e);
     return false;
   }
 }

 async getUsers(usersArray){

   if(!usersArray || usersArray < 1){
     return false;
   }

   //convert to mongo object ids
   for(let userID of usersArray){
     userID = new ObjectID(userID);
   }

   try{
     const result = await this.collection
     .find({_id : {$in : usersArray }})
     .project({password : 0})
     .toArray();

     if(!result || result.length == 0){
       return false;
     }

     return result;
   }catch(e){
     return false;
   }

 }
 /*
   @params - userID - id of user for query
   Description: get email
 */
 async getEmail(userID){

   if(!userID){
     return false;
   }

   let email = false;//await this.getKeyFromCache(this.prefix  + userID,'email');
   if(email && email.length > 0){
     return email;
   }

   try{

     const result = await this.collection
     .find({_id : new ObjectID(userID)})
     .project({email : 1,_id : 0})
     .toArray();

     if(result.length == 0){
       return false;
     }

     email = result[0].email;
    // this.setKeyToCache(this.prefix + userID,'email',email);

     return email;

   }catch(e){
     debug('ERROR, failed to get email, ' + e);
     return false;
   }
 }

 /*
   @params - userID - id of user for query
   Description: get name
 */
 async getName(userID){

   if(!userID){
     return false;
   }

   let name = false;//await this.getKeyFromCache(this.prefix  + userID,'email');
   if(name){
     return name;
   }

   try{
     const result = await this.collection
     .find({_id : new ObjectID(userID)})
     .project({username : 1,_id : 0})
     .toArray();

     if(result.length == 0){
       return false;
     }

     name = result[0].username;
    // this.setKeyToCache(this.prefix + userID,'name',name);

     return name;

   }catch(e){
     debug('ERROR, failed to get email, ' + e);
     return false;
   }
 }

 /*
   @param - email - email used for checking
   Description: check to see if email exists
 */
 async emailExists(email){
   if(!email){
     return false;
   }
   return await this.collection.count({email : email.toLowerCase()});
 }

 /*
   @params - userID - id of user for query
   Description: get photo
 */
 async getPhoto(userID){
   if(!userID){
     return false;
   }

   let photo = false;//await this.getKeyFromCache(this.prefix + userID,'photo');
   if(photo && photo.length > 0){
     return photo;
   }

   try{

     const result = await this.collection
     .find({_id : new ObjectID(userID)})
     .project({ photo : 1, _id : 0 })
     .toArray();

     if(result.length == 0){
       return false;
     }

     photo = result[0].photo;
     //this.setKeyToCache(this.prefix + userID,'photo',photo);

     return photo;

   }catch(e){
     debug('ERROR, failed to get photo, ' + e)
     return false;
   }
 }

 /*
   @params - userID - id of user for query
   Description: get password
 */
 async getPassword(userID){
   if(!userID){
     return false;
   }

   try{
     const result = await this.collection
     .find({_id : new ObjectID(userID)})
     .project({ password : 1, _id : 0 })
     .toArray();

     if(result.length == 0){
       return false;
     }

     return result[0].password;

   }catch(e){
     debug('ERROR, failed to get password, ' + e);
     return false;
   }
 }

 /*
   @params - userID - id of user for query
   Description: get facebook account
 */
 async getFacebookID(userID){
   if(!userID){
     return false;
   }

   try{

     const result = await this.collection.find({_id : new ObjectID(userID)})
     .project({ facebookID : 1, _id : 0 })
     .toArray();
     if(result.length == 0){
       return false;
     }
     return result[0].facebookID;

   }catch(e){
     debug('ERROR, failed to get facebook account, ' + e);
     return false;
   }
 }

 async getAddress(userID){
   if(!userID){
     return false;
   }
   try{
     const result = await this.collection
     .find({_id : new ObjectID(userID)})
     .project({ address : 1, _id : 0 })
     .toArray();

     if(result.length == 0){
       return false;
     }
    return result[0].address;

   }catch(e){
     console.log('ERROR, failed to get account, ' + e);
     return false;
   }
 }

 getFormattedAddress(addressObject){
     if(!addressObject.address && !addressObject.state &&
        !addressObject.zipcode && !addressObject.city){
       return false;
     }
     let addressString = addressObject.address;
     if(addressObject.address2){
       addressString += ' ' + addressObject.address2;
     }
     addressString += ', ' + addressObject.city + ',' + addressObject.state + ' ' + addressObject.zipcode;
    return addressString;
 }

 /*
   @param - facebookID - facebook id
   Description: check to see if facebook ID exists
 */
 async getUserFromFacebook(facebookID){

   if(!facebookID){
     return false;
   }

   try{

     const result = await this.collection.find({facebookID : facebookID})
     .project({ facebookID : 1, _id : 1, username : 1 })
     .toArray();

     if(result.length == 0){
       return false;
     }
     return result[0];

   }catch(e){
     debug('ERROR, failed to get facebook account, ' + e);
     return false;
   }
 }

 /*
   @params - userID - id of user for query
   Description: get tokens
 */
 async getDevices(userID){

   if(!userID){
     return false;
   }

   /*
   let devices = await this.getKeyFromCache(this.prefix + userID,'devices');
   if(devices && devices.length > 0){
     return devices.split(',');
   } */

   try{

     const result = await this.collection
     .find({_id : new ObjectID(userID)})
     .project({ devices : 1, _id : 0 })
     .toArray();

     if(result.length == 0){
       return false;
     }

     let devices = result[0].devices;
     //this.setKeyToCache(this.prefix + userID,'devices', devices.join(','));

     return devices;

   }catch(e){
     debug('ERROR, failed to get user devices, ' + e);
     return false;
   }
 }

 async search(search){
   if(!search){
     return [];
   }
   try{
     const result = await this.collection
     .find({username : {$regex : search.replace(/\s/g, '').toString().toLowerCase(),$options: 'i'}})
     .project({password : 0,devies : 0})
     .toArray();

     if(!result || result.length == 0){
       return [];
     }

     return result;
   }catch(e){
     debug('ERROR: Failed to search for user');
     return [];
   }
 }
}

module.exports = new UserModel();
