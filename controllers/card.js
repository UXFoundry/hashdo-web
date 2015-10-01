var HashDo = require('hashdo'),
  Utils = require('../lib/utils');

function getIpAddress(req) {
  // IP address
  var ip = req.headers['x-forwarded-for'];
  if (ip) {
    // Found the client IP forwarded for a proxy, take the first one (http://stackoverflow.com/a/19524949/564726).
    return ip.split(',')[0];
  }
  else {
    return req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
  }
}

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
  // Add the ip address 
  var inputValues = req.query; 
  inputValues.ipAddress = getIpAddress(req);
  
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
      Utils.respond(req, res, 500, err);
    }
  });
};

