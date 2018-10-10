const {db} = require('./../services/database');
const {ObjectID} = require('mongodb');
const {promisify} = require('util');
const redis = require('./../services/redis');
const debug = require('debug')('Sailor:SaleModel');
const config = require('./../config');

class SaleModel{

	constructor(){
    this.prefix = 'sale';
    this.collection = db.collection(this.prefix);

    //redis commands as cache functions
    this.getKeyFromCache = promisify(redis.hget).bind(redis);
    this.setKeyToCache = promisify(redis.hset).bind(redis);
    this.getCache = promisify(redis.get).bind(redis);
    this.setCache = promisify(redis.set).bind(redis);
		this.pullStack = promisify(redis.lrange).bind(redis);
		this.pushStack = promisify(redis.lpush).bind(redis);

	}

  /*
		@params - storyObject - object representing the story
		Description: adds new story to database
	*/
	async setSale(saleObject){
		if(!saleObject){
			return false;
		}
		try{
			await this.collection.insertOne(saleObject);
      return true;
		}catch(e){
			debug('ERROR, failed to add sale, ' + e);
			return false;
		}
	}

	/*
		@params - saleID - id of sale for retreival
		Description : get story
	*/
	async getSale(saleID){
		if(!saleID){
			return false;
		}

	/*	let story = await this.getCache(this.prefx + '_' + saleID);
		if(story && story.length > 0){
			return JSON.parse(story);
		} */

		try{
			const result = await this.collection
			.find({_id : new ObjectID(saleID)})
			.toArray();
			if(!result || result.length == 0){
				return false;
			}
			let sale = result[0];
		//	await this.setCache(this.prefx + '_' + saleID,JSON.stringify(story));
			return sale;

		}catch(e){
			debug('ERROR: Failed to get sale from database, ' + e);
			return false;
		}
	}

	async getSale(saleArray){
		if(!saleArray || saleArray < 1){
			return false;
		}

		for(let i= 0; i < saleArray.length; i++){
			saleArray[i] = new ObjectID(saleArray[i]);
		}

		//convert to mongo object ids
		try{
			const result = await this.collection
			.find({_id : {$in : saleArray }})
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

	async getUserSales(userID){
		if(!userID){
			return false;
		}
		//convert to mongo object ids
		try{
			const result = await this.collection
			.find({userID : userID})
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

	async getHome(index = 0){

    try{
      const result = await this.collection
      .find({})
			.sort({timestamp : -1})
			.toArray();

      return result;

    }catch(e){
      debug('ERROR, failed to add story, ' + e);
      return false;
    }
	}

  /*
    @params - saleID - id of story for updating
    @params - saleObject - story data
    Description: update story
  */
  async update(saleID,saleObject){
    if(!saleObject){
      return false;
    }

    try{
      await this.collection
      .updateOne({ _id : new ObjectID(saleID)},{ $set : saleObject }, {upsert: true});
      return true;

    }catch(e){
      debug('ERROR, failed to add sale, ' + e);
      return false;
    }
  }

	async remove(saleID){
		if(!saleID){
			return false;
		}
		try{
			await this.collection.deleteOne({_id : new ObjectID(saleID)});
			return true;
		}catch(e){
			debug('ERROR: failed to delete sale: ' + saleID + ', error: ' + e);
			return false;
		}
	}

  /*
    @param - userID - id of user who made story
    @param - timestamp - time the story was made
    Description: get saleID from user info
  */
  async getSaleID(userID,timestamp){
		if(!userID || !timestamp){
			return false;
		}

		try{
			const result = await this.collection
      .find({userID : userID,timestamp : timestamp})
      .project({ _id : 1 })
      .toArray();

      if(result.length == 0){
        return false;
      }
			return result[0]._id;

		}catch(e){
			debug('ERROR, failed to get story id, ' + e);
			return false;
		}
	}

  /*
    @param - saleID - id of the story
    Description: get user who made story
  */
  async getUserID(saleID){
      if(!saleID){
        return false;
      }

      let userID = await this.getKeyFromCache(this.prefx + saleID,'userID');
      if(userID && userID.length > 0){
        return userID;
      }

      try{
        const result = await this.collection
        .find({ _id : new ObjectID(saleID.toString())})
        .project({_id : 0, userID : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        userID = result[0].userID;
        this.setKeyToCache(this.prefix + saleID,'userID',userID);

        return userID;

      }catch(e){
        return false;
      }
  }
  /*
    @param - saleID - id of the story
    Description: get title of the story
  */
  async getTitle(saleID){
      if(!saleID){
        return false;
      }

      let title = await this.getKeyFromCache(this.prefx + saleID,'title');
      if(title && title.length > 0){
        return title;
      }

      try{
        const result = await this.collection
        .find({ _id : saleID})
        .project({ _id : 0, title : 1 })
        .toArray();

        if(result.length == 0){
          return false;
        }

        title = result[0].title;
        this.setKeyToCache(this.prefx + saleID,'title',title);

        return title;

      }catch(e){
        return false;
      }
  }

  /*
    @param - saleID - id of the story
    Description: get text from story
  */
  async getDescription(saleID){
      if(!saleID){
        return false;
      }

      let description = await this.getKeyFromCache(this.prefx + saleID,'description');

      try{
        const result = await this.collection
        .find({_id : new ObjectID(saleID)})
        .project({_id : 0, description : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        description = result[0].description;
        this.setKeyToCache(this.prefx + saleID,'description',description);

        return description;

      }catch(e){
        return false;
      }
  }


  /*
    @param - saleID - id of the story
    Description: get thumbnail from story
  */
  async getThumbnails(saleID){
      if(!saleID){
        return false;
      }

      let thumbnails = await this.getKeyFromCache(this.prefx + saleID,'thumbnails');

      try{
        const result = await this.collection
        .find({_id : new ObjectID(saleID)})
        .project({_id : 0, thumbnails : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        thumbnails = result[0].thumbnails;
        this.setKeyToCache(this.prefx + saleID,'thumbnails',thumbnails);

        return thumbnails;

      }catch(e){
        return false;
      }
  }

  /*
    @param - saleID - id of the story
    Description: get timestamp from story
  */
  async getTimestamp(saleID){
      if(!saleID){
        return false;
      }

      let timestamp = await this.getKeyFromCache(this.prefx + saleID,'timestamp');

      try{
        const result = await this.collection
        .find({_id : new ObjectID(saleID)})
        .project({_id : 0, timestamp : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        timestamp = result[0].timestamp;
        this.setKeyToCache(this.prefx + saleID,'timestamp',timestamp);

        return timestamp;

      }catch(e){
        return false;
      }
  }

	async search(search){
		if(!search){
			return [];
		}
		try{
			const result = await this.collection
			.find({title : {$regex : search.toString(),$options: 'i'}})
			.toArray();

			if(!result || result.length == 0){
				return [];
			}
			return result;
		}catch(e){
			debug('ERROR: Failed to search for sale');
			return [];
		}
	}


}

module.exports = new SaleModel();
