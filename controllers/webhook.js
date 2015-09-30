var HashDo = require('hashdo');

module.exports = {
  process: function (req, res) {
    var payload = {};
          
    if (req.body.payload || req.body) {
      try {
        payload = JSON.parse(req.body.payload || req.body);
      }
      catch (err) {
        console.error('WEBHOOK: Request body for %s/%s was not valid JSON data.', req.params.pack, req.params.card, err);
      }
    }
    
    HashDo.card.webhook({
      directory: process.env.CARDS_DIRECTORY,
      packName: req.params.pack,
      cardName: req.params.card,
      payload: payload
    },
    function (err) {
      // Errors are ignored for now.
      if (err) {
        console.error('WEBHOOK: Error executing the webhook function for %s/%s.', req.params.pack, req.params.card, err);
      }
      
      res.status(200);
      res.send({});
    });
  }
};


