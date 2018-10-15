const {db} = require('./../services/database');
const {ObjectID} = require('mongodb');
const {promisify} = require('util');
//const redis = require('./../services/redis');
const debug = require('debug')('Sailor:NotificationModel');
const config = require('./../config');

class NotificationModel{
  constructor(){
    this.prefix = 'notif';
    this.collection = db.collection('notification');
  }

  async setNotification(notificationObject){
    if(!notificationObject){
      return false;
    }

    try{
        await this.collection.insertOne(notificationObject);
        return true;
    }catch(e){
        debug('ERROR, failed to add notification, ' + e);
      return false;
    }
  }

  async update(notificationID,notificationObject){

    if(!notificationObject){
      return false;
    }

    try{
      await this.collection
      .updateOne({ _id : new ObjectID(notificationID) },{ $set : notificationObject }, {upsert: true});
      return true;

    }catch(e){
      debug('ERROR, failed to update notification, ' + e);
      return false;
    }
  }

  async remove(notificationID){
    if(!notificationID){
      return false;
    }

    try{
      const result = await this.collection.deleteOne({_id : new ObjectID(notificationID)});
      return true;

    }catch(e){
      return false;
    }
  }

  async getNotification(notificationID){
    if(!notificationID){
      return false;
    }

    try{
      const result = await this.collection
      .find({_id : new ObjectID(notificationID)})
      .toArray();

      return result;

    }catch(e){
      return false;
    }
  }

  async getNotifications(notificationArray){
		if(!notificationArray || notificationArray < 1){
			return false;
		}
		//convert to mongo object ids
		for(let notificationID of notificationArray){
			notificationID = new ObjectID(notificationID);
		}

		try{
			const result = await this.collection
			.find({_id : {$in : notificationArray }})
      .sort({timestamp : -1})
			.toArray();

			if(!result || result.length == 0){
				return false;
			}

			return result;
		}catch(e){
			return false;
		}

	}

  async getUserNotifications(userID){
    if(!userID){
      return false;
    }

    try{
      const result = await this.collection
      .find({userID : userID})
      .sort({timestamp : -1})
      .toArray();
      return result;

    }catch(e){
      return false;
    }
  }

  async getStatus(notificationID){
    if(!notificationID){
      return false;
    }

    try{
      const result = await this.collection
      .find({_id : new ObjectID(notificationID)})
      .project({ status : 1, _id : 0})
      .toArray();

      return result[0];

    }catch(e){
      return false;
    }
  }

  async getTimestamp(notificationID){
    if(!notificationID){
      return false;
    }

    try{
      const result = await this.collection
      .find({_id : new ObjectID(notificationID)})
      .project({ timestamp : 1, _id : 0})
      .toArray();

      return result[0];

    }catch(e){
      return false;
    }
  }

  async findNotification(userID,timestamp){
    if(!userID || !timestamp){
      return false;
    }

    try{
      const result = await this.collection
      .find({ userID : userID, timestamp : timestamp})
      .project({_id : 1})
      .toArray();

      return result[0]._id;

    }catch(e){
      return false;
    }
  }
}

module.exports = new NotificationModel();
