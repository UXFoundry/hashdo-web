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

    if (req.timedout) return;

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
      else if (message.message) {
        message = message.message;
      }

      message = message || '';

      res.status(status).send(message);
    }
    else {
      var json = {};
      json[type] = message;

      res.status(status).send(json);
    }
  },

  getIPAddress: function (req) {
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
};