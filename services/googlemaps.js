const config = require('./../config');
module.exports = require('@google/maps').createClient({
  key: config.google.apiKey
});
