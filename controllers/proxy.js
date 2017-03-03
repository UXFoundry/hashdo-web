var HashDo = require('hashdo'),
  Request = require('request'),
  SafeParse = require('safe-json-parse/callback'),
  Utils = require('../lib/utils'),
  _ = require('lodash');

module.exports = {
  post: function (req, res) {
    var inputValues = req.query;

    if (req.timedout) return;

    if (inputValues) {
      inputValues.ipAddress = Utils.getIPAddress(req);
    }

    HashDo.card.getInputs({
      url: req.url,
      directory: process.env.CARDS_DIRECTORY,
      packName: req.params.pack,
      cardName: req.params.card,
      inputValues: inputValues
    },
    function (err, inputs) {
      if (err) {
        res.status(500);
        res.send({
          error: true,
          message: 'Error parsing input values: ' + err
        });
      }
      else {
        var apiKey = req.body.apiKey,
          cardKey = req.body.cardKey,
          endpoint = req.body.endpoint,
          isJSON = req.body.json,
          DB = HashDo.db;

        if (!endpoint) {
          res.status(400);
          res.send({
            error: true,
            message: 'Invalid parameters. Missing endpoint value.'
          });
        }
        else {
          DB.validateAPIKey(cardKey, apiKey, function (err, isValid) {
            if (isValid) {
              SafeParse(req.body.params, function (err, params) {
                if (!err) {
                  params = _.extend(params, inputs);

                  var args = {
                    url: endpoint,
                    json: true,
                    timeout: 10000
                  };

                  if (isJSON) {
                    args.json = params;
                  }
                  else {
                    args.form = params;
                  }

                  Request.post(args, function (err, response, body) {
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
    });
  }
};