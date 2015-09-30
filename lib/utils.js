var Path = require('path'),
  FS = require('fs');

module.exports = {
  getVersion: function () {    
    var packagePath = Path.join(process.cwd(), 'package.json');
    try {
      FS.statSync(packagePath);
      return require(packagePath).version;
    }
    catch (err) {}
    
    return 'Unknown';
  },
  
  respond: function (req, res, status, message, type) {
    var isJSON = false,
      contentType = req.get('content-type');

    if (contentType && contentType.indexOf('json') > -1) {
      isJSON = true;
    }

    if (!type) {
      if (status === 200) {
        type = 'success';
      }
      else {
        type = 'error';
      }
    }

    if (!isJSON) {
      if (message && message.errors) {
        var errors = [];

        for (var i = 0; i < message.errors.length; i++) {
          errors.push(message.errors[i].reason);
        }

        message = errors.join(', ');
      }

      message = message || '';

      res.status(status);
      res.send(message);
    }
    else {
      var json = {};
      json[type] = message;

      res.status(status);
      res.send(json);
    }
  }
};