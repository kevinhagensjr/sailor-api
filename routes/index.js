const express = require('express');
const debug = require('debug')('Sailor:Router');

class Router {
	constructor(api) {
		this.v1Router = require('./v1')(api); //support api version 1
	}
}

module.exports = (api) => {
  return new Router(api);
};
