var HashDo = require('hashdo'),
  Utils = require('../lib/utils');

exports.post = function (req, res) {
  HashDo.card.secureInputs(req.params.pack, req.params.card, req.body, function (err, token) {
    if (!err) {
      Utils.respond(req, res, 200, token);
    }
    else {
      Utils.respond(req, res, 500, err);        
    }
  });
};

exports.get = function (req, res) {  
  var inputValues = req.query;

  if (inputValues) {
    inputValues.ipAddress = Utils.getIPAddress(req);
  }
  
  HashDo.card.generateCard({
    url: req.url,
    directory: process.env.CARDS_DIRECTORY, 
    packName: req.params.pack,
    cardName: req.params.card,
    inputValues: inputValues
  },
  function (err, html) {
    if (!err) {
      Utils.respond(req, res, 200, html);
    }
    else {
      // Suppress the error from the user in production.
      if (process.env.NODE_ENV === 'production') {
        Utils.respond(req, res, 500, '');
      }
      else {
        Utils.respond(req, res, 500, err);
      }
    }
  });
};

