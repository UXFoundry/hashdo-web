var Async = require('async'),
  HashDo = require('hashdo'),  
  Utils = require('../lib/utils'),
  SafeParse = require('safe-json-parse/callback'),
  _ = require('lodash'),

  Analytics = HashDo.analytics,  
  DB = HashDo.db,
  Packs = HashDo.packs;

function paginate(arr, page) {
  var pages = [],
    size = 20,
    total = arr.length;

  page = page || 1;

  while (arr.length) {
    pages.push(arr.splice(0, size));
  }

  return {
    success: true,
    version: Utils.getVersion(),
    total: total,
    page: page,
    pageCount: pages.length,
    perPage: size,
    cards: pages[page - 1] || []
  };
}

module.exports = {
  count: function (req, res) {
    res.status(200);
    res.send({
      success: true,
      count: Packs.count()
    });
  },

  cards: function (req, res) {
    var filter = req.query.q || '',
      page = req.query.page || 1,
      results = Packs.cards(filter),
      paginatedResults = paginate(results, page);
  
    res.status(200);
    res.send(paginatedResults);
  },

  card: function (req, res) {
    var packName = req.query.pack,
      cardName = req.query.card,
      card = Packs.card(packName, cardName);
  
    if (card) {
      res.status(200);
      res.send({
        success: true,
        card: card
      });
    }
    else {
      res.status(404);
      res.send({
        error: true,
        message: 'Card not found'
      });
    }
  },

  saveState: function (req, res) {
    var apiKey = req.body.apiKey,
      cardKey = req.body.cardKey;

    SafeParse(req.body.state, function (err, state) {
      if (!err) {
        DB.validateAPIKey(cardKey, apiKey, function (err, isValid) {
          if (isValid) {
            DB.getCardState(cardKey, null, function (err, currentCardState) {
              DB.saveCardState(cardKey, HashDo.utils.deepMerge(true, true, currentCardState || {}, state), function (err) {
                if (err) {
                  res.status(500);
                  res.send({
                    error: true,
                    message: err.message || err
                  });
                }
                else {
                  res.status(200);
                  res.send({
                    success: true
                  });
                }
              });
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
      else {
        res.status(400);
        res.send({
          error: true,
          message: 'Invalid parameters'
        });
      }
    });
  },

  clearState: function (req, res) {
    var apiKey = req.body.apiKey,
      cardKey = req.body.cardKey;

    DB.validateAPIKey(cardKey, apiKey, function (err, isValid) {
      if (isValid) {
        DB.saveCardState(cardKey, {}, function (err) {
          if (err) {
            res.status(500);
            res.send({
              error: true,
              message: err.message || err
            });
          }
          else {
            res.status(200);
            res.send({
              success: true
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
  },

  recordAnalyticEvents: function (req, res) {
    var apiKey = req.body.apiKey,
      cardKey = req.body.cardKey,
      pack = req.body.pack,
      card = req.body.card;
  
    SafeParse(req.body.events, function (err, events) {
      if (!err) {
        DB.validateAPIKey(cardKey, apiKey, function (err, isValid) {
          if (isValid) {
            if (_.isArray(events)) {
              Async.each(events,
  
                function (item, callback) {
                  Analytics.addEvent(pack + '.' + card + '.' + item.key, item.data, function (err) {
                    callback(err);
                  });
                },
  
                function (err) {
                  if (err) {
                    res.status(500);
                    res.send({
                      error: true,
                      message: err.message || err
                    });
                  }
                  else {
                    res.status(200);
                    res.send({
                      success: true
                    });
                  }
                }
              );
            }
            else {
              Analytics.addEvent(pack + '.' + card + '.' + events.key, events.data, function (err) {
                if (err) {
                  res.status(500);
                  res.send({
                    error: true,
                    message: err.message || err
                  });
                }
                else {
                  res.status(200);
                  res.send({
                    success: true
                  });
                }
              });
            }
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
      else {
        res.status(400);
        res.send({
          error: true,
          message: 'Invalid parameters'
        });
      }
    });
  }
};
