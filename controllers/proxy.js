var HashDo = require('hashdo'),
  Request = require('request'),
  SafeParse = require('safe-json-parse/callback');

module.exports = {
  post: function (req, res) {
    var apiKey = req.body.apiKey,
      cardKey = req.body.cardKey,
      endpoint = req.body.endpoint,

      DB = HashDo.db;

    if (!endpoint) {
      res.status(400);
      res.send({
        error: true,
        message: 'Invalid parameters'
      });
    }
    else {
      DB.validateAPIKey(cardKey, apiKey, function (err, isValid) {
        if (isValid) {
          SafeParse(req.body.params, function (err, params) {
            if (!err) {
              Request.post({url: endpoint, form: params}, function (err, httpResponse, body) {
                if (err) {
                  res.status(500);
                  res.send({
                    error: true,
                    message: 'Error posting to ' + endpoint + ': ' + err
                  });
                }
                else {
                  res.status(200);
                  res.send(body);
                }
              });
            }
            else {
              res.status(400);
              res.send({
                error: true,
                message: 'Invalid parameters'
              });
            }
          });
        }
        else {
          var errorMessage = 'Invalid #Do API Key';

          if (err) {
            errorMessage = errorMessage + ' - ' + (err.message || err);
          }

          res.status(400);
          res.send({
            error: true,
            message: errorMessage
          });
        }
      });
    }
  }
};