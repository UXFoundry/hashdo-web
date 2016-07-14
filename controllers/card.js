var HashDo = require('hashdo'),
  Utils = require('../lib/utils'),
  VM = require('vm2').NodeVM,

  isProduction = process.env.NODE_ENV === 'production',
  cardsDirectory = process.env.CARDS_DIRECTORY;

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

  // input params
  var params = {
    url: req.url,
    directory: cardsDirectory,
    packName: req.params.pack,
    cardName: req.params.card,
    inputValues: inputValues
  };

  // callback
  var cb = function (err, html) {
    if (err) {
      Utils.respond(req, res, 500, isProduction ? '' : err);
    }
    else {
      Utils.respond(req, res, 200, html);
    }
  };

  vm = new VM({
    console: 'inherit',
    require: true,
    sandbox: {
      HashDo: HashDo
    }
  });
  
  var vmFunc = vm.run('module.exports = HashDo.card.generateCard;');
  vmFunc(params, cb);
};

