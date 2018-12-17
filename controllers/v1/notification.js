const debug = require('debug')('Sailor:NotificationController');
const config = require('./../../config');
const auth = require('./../../services/auth');
const relativeDate = require('relative-date');

class NotificationController{
	constructor(){
		this.notificationModel = require('./../../models/notification');
		this.userModel = require('./../../models/user');
		this.statusTypes = [
			'sent', 'read'
		];
	}
  async notifications(req,res){
		const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error : 'Account is not valid'
			});
		}

		let notifications = await this.notificationModel.getUserNotifications(userID);
		if(!notifications){
			return res.json([]);
		}

		for(let i =0; i < notifications.length; i++){
			//notifications[i]['photo'] = await this.userModel.getPhoto(notifications[i]['userID']);
			notifications[i]['username'] = await this.userModel.getName(notifications[i]['userID']);
			notifications[i]['timestamp'] =  relativeDate(notifications[i]['timestamp']);
			notifications[i]['message'] = "@" + notifications[i]['message'];
			notifications[i]['message'] += " " + notifications[i]['timestamp'];
		}

		return res.json(notifications);
  }

  async notification(req,res){

  }

  async story(req,res){

  }

	async update(req,res){
		const userID = auth.getUserID(req);
		const notificationID = req.body.notificationID;
		const status = req.body.status;

		if(!userID){
			return res.json({
				success : false,
				error : 'Account is not valid'
			});
		}

		if(!status || !this.statusTypes.includes(status)){
			return res.json({
				success : false,
				error : 'Could not find status'
			});
		}

		const updated = await this.notificationModel.update(notificationID,{
			status : status
		});
		if(!updated){
			return res.json({
				success : false,
				error : 'Failed to update notification status'
			});
		}
		return res.json({
			success : true
		});
	}

}

module.exports = new NotificationController();
