const debug = require('debug')('Sailor:SaleController');
const config = require('./../../config');
const auth = require('./../../services/auth');
const RabbitMQ = require('./../../services/rabbitmq');
const relativeDate = require('relative-date');

class SaleController{

	constructor(){
		this.saleModel = require('./../../models/sale');
    this.userModel = require('./../../models/user');
		this.notificationModel = require('./../../models/notification');
	}

  async post(req,res){
      const userID = auth.getUserID(req);
      const title = req.body.title;
      let description = req.body.description;
      const thumbnailList = req.body.thumbnails;
			const address = req.body.address;
			const phone   = req.body.phone;
			const rating  = req.body.rating;
			const timestamp = Date.now();

			if(!userID){
				return res.json({
					success : false,
					error : 'Account is not valid'
				});
			}

			if(!title){
				return res.json({
					success : false,
					error : 'Sale does not have title'
				});
			}

			if(!description){
				description = "";
			}

      let saleObject = {
				userID : userID,
				title : title,
				description : description,
				timestamp : timestamp,
				pref : {
					phone : phone,
					rating : rating,
					address : address
				}
			};

			let thumbnails = [];
			if(thumbnailList){
				thumbnails = thumbnailList.split(',');
				for(let i=0; i < thumbnails.length; i++){
						thumbnails[i] = config.cdn + thumbnails[i];
				}
			}

			if(thumbnails.length > 0){
				saleObject.thumbnails = thumbnails;
			}

			const saleAdded = await this.saleModel.setSale(saleObject);
			if(!saleAdded){
				return res.json({
	        success : false,
	        error : 'Could not post sale'
	      });
			}
			const saleID = await this.saleModel.getSaleID(userID,timestamp);
			if(!saleID){
				return res.json({
					success : false,
					saleID : "Could not post sale"
				});
			}

			//create notification
			const username = await this.userModel.getName(userID);
			if(username){
					const message = username + ' posted a sale';
					await this.notificationModel.setNotification({
						userID : userID,
						type : 'post',
						message : message,
						details : {
							saleID : saleID
						},
						timestamp : timestamp
					});

				 const notificationID = await this.notificationModel.findNotification(userID,timestamp);
				 if(notificationID){
						//start background tasks
					/*	const rabbitMQ = new RabbitMQ();
						const brokerConnected = await rabbitMQ.connect();
						if(brokerConnected){
							rabbitMQ.startJob({
								userID : userID,
								storyID : storyID,
								notificationID : notificationID,
								thumbnail : thumbnailUrl,
								username : username,
								text : text,
								message : message,
								timestamp : timestamp,
								job : 'publish'
							});
						} */
				}

				debug('SALE POSTED: userID: ' + userID + ', saleID: ' + saleID + ' message: ' + message);
		}

		const link = "garagesailor.com/sale/" + saleID;//'http://topik.me/story/' + storyID;
		return res.json({
			success : true,
			saleID : saleID,
			link : link
		});
  }

  async sale(req,res){
    const userID = auth.getUserID(req);
    const saleID = req.params.saleID;

    if(!saleID){
      return res.json({
        success : false,
        error : 'Sale id is invalid'
      });
    }

    let sale = await this.saleModel.getSale(saleID);
    if(!sale){
      return res.json({
        success : false,
        error : 'Could not find sale'
      });
    }

    sale.username = await this.userModel.getUsername(sale.userID);
		sale.thumbnails = await this.userModel.getThumbnails(sale.userID);
		sale.timestamp = relativeDate(sale.timestamp);

    return res.json(sale);
  }

  async remove(req,res){
    const userID = auth.getUserID(req);
    const saleID = req.params.saleID;

    if(!userID){
      res.json({
        success : false,
        error : 'account is invalid'
      });
    }

		if(!saleID){
			res.json({
				success : false,
				error : 'Sale id is invalid'
			});
		}

    const removed = await this.saleModel.remove(saleID);
    if(!removed){
      return res.json({
        success : false,
        error : 'Failed to remove sale'
      });
    }

    return res.json({
      success : true
    });
  }

	async update(req,res){
		const userID = auth.getUserID(req);
		const title = req.body.title;
		const description = req.body.description;

		if(!userID){
			return res.json({
				success : false,
				error : 'Account is not valid'
			});
		}

		if(!title){
			return res.json({
				success : false,
				error : 'Story does not have title'
			});
		}

		if(!description){
			description = "";
		}

		let saleObject = {
			title : title,
			description : description
		};

		const updated = this.saleModel.update(saleID,saleObject);
		if(!updated){
			return res.json({
				success : false,
				error : 'Failed to update sale'
			});
		}
		return res.json({
			success : true
		});
	}

	async userSales(req,res){
		const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error : 'Account is not valid'
			});
		}

		const sales = await this.saleModel.getUserSales(userID);
		if(!sales){
			return res.json([]);
		}
		return res.json(sales);
	}

}

module.exports = new SaleController();
