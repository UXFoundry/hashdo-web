var Utils = require('../lib/utils');

module.exports = function (req, res) {
  Utils.respond(req, res, 422, 'Unknown card.');  
};

