var HashDo = require('hashdo'),
  BodyParser = require('body-parser'),
  Express = require('express'),
  App = Express();

module.exports = {
  // Access to internal HashDo object.
  hashdo: HashDo,
  
  // Access to the Express app object for adding middleware and routes externall.
  express: App,
  
  init: function (baseUrl, firebaseUrl, port, cardsDirectory) {
    // Set environment variables.
    process.env.BASE_URL = baseUrl || '';
    process.env.FIREBASE_URL = firebaseUrl || 'https://hashdodemo.firebaseio.com/',
    process.env.CARDS_DIRECTORY = cardsDirectory || process.cwd();
    process.env.PORT = port || 4000;
    
    var Path = require('path'),
      Favicon = require('serve-favicon'),
      Hpp = require('hpp');

    App.use(Favicon(Path.join(__dirname, '/public/favicon.ico')));
    App.use(Express.static('public'));
    // Hacky, quick fix required for now.
    // **********************************
    App.use('/js', Express.static(Path.join(__dirname, '/node_modules/hashdo/public/js')));
    App.use('/css', Express.static(Path.join(__dirname, '/node_modules/hashdo/public/css')));
    // **********************************
    App.use(BodyParser.urlencoded({extended: false}));
    App.use(Hpp());
    
    // CORS support
    App.all('*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
    
    // Assume cards directory is based off root if a full path is not provided.
    if (!Path.isAbsolute(process.env.CARDS_DIRECTORY)) {
      process.env.CARDS_DIRECTORY = Path.join(process.cwd(), process.env.CARDS_DIRECTORY);
    }
    
    HashDo.packs.init(baseUrl, process.env.CARDS_DIRECTORY);

    // Make public card directories static
    HashDo.packs.cards().forEach(function (card) {
      var packDirectory = Path.join(cardsDirectory, 'hashdo-' + card.pack);  
      App.use('/' + card.pack + '/' + card.card, Express.static(Path.join(packDirectory, 'public', card.card)));
    });
  },
  
  start: function (callback) {
    var APIController = require('./controllers/api'),
      DefaultController = require('./controllers/index'),
      PackController = require('./controllers/pack'),
      CardController = require('./controllers/card'),
      WebHookController = require('./controllers/webhook'),
      JsonParser = BodyParser.json({
        strict: false
      });
    
    // Disable caching middleware.  
    var nocache = function (req, res, next) {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      next();
    }

    // Setup routes late to give implementers routes higher priority and allow middleware as well.
    App.get('/api/count', nocache, APIController.count);
    App.get('/api/cards', nocache, APIController.cards);
    App.get('/api/card', nocache, APIController.card);
    
    App.post('/api/card/state/save', APIController.saveState);
    App.post('/api/card/analytics', APIController.recordAnalyticEvents);
    
    // Web Hooks
    App.post('/webhook/:pack/:card', WebHookController.process);
    
    // Card Routes
    App.post('/:pack/:card', JsonParser, CardController.post);
    App.get('/:pack/:card', CardController.get);
    
    App.get('/:pack', PackController);
    App.get('/', DefaultController);
    
    var exit = function () {
      HashDo.db.disconnect(function () {
        process.exit(0);
      });
    };
    
    // Gracefully disconnect from the database on expected exit.
    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);
    
    // Global error handler (always exit for programmatic errors).
    process.on('uncaughtException', function (err) {
      console.error('FATAL: ', err.message);
      console.error(err.stack);
      process.exit(1);
    });
    
    // Connect to the database and start server on successful connection.
    HashDo.db.connect(function (err) {
      if (err) {
        console.error('FATAL: Could not connect to database.', err);
        process.exit(1);
      }
      else {
        console.log('WEB: Starting web server on port %d...', process.env.PORT);
        App.listen(process.env.PORT, function () {
          console.log();
          console.log('Let\'s #Do');
          
          callback && callback();
        });
      }
    });
  }
};
