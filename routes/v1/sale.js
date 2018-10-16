const express = require('express');
const debug = require('debug')('Sailor:SaleRouter');

class SaleRouter{
	constructor(){
		this.saleController = require('../../controllers/v1/sale');
		this.router = new express.Router();
		this.listen();
	}

	listen(){
		const self = this;

		this.router.get('/', (req, res) => {
			return self.saleController.sales(req, res);
		});

		this.router.get('/:saleID', (req, res) => {
			return self.saleController.sale(req, res);
		});

    this.router.post('/post', (req, res) => {
			return self.saleController.post(req, res);
		});

    this.router.post('/remove', (req, res) => {
			return self.saleController.remove(req, res);
		});

    this.router.post('/update', (req, res) => {
			return self.saleController.update(req, res);
		});
	}

	getRouter(){
		return this.router;
	}
}

//export router for /user endpoint
const saleRouter = new SaleRouter();
module.exports = saleRouter.getRouter();
