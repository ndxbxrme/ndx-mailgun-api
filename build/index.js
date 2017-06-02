(function() {
  'use strict';
  var jade, superagent;

  superagent = require('superagent');

  jade = require('jade');

  module.exports = function(ndx) {
    var apiKey, baseUrl, callbacks, fillTemplate, safeCallback, url;
    apiKey = process.env.EMAIL_API_KEY || ndx.settings.EMAIL_API_KEY;
    baseUrl = process.env.EMAIL_BASE_URL || ndx.settings.EMAIL_BASE_URL;
    fillTemplate = function(template, data) {
      return template.replace(/\{\{(.+?)\}\}/g, function(all, match) {
        var evalInContext;
        evalInContext = function(str, context) {
          return (new Function("with(this) {return " + str + "}")).call(context);
        };
        return evalInContext(match, data);
      });
    };
    callbacks = {
      send: [],
      error: []
    };
    safeCallback = function(name, obj) {
      var cb, i, len, ref, results;
      ref = callbacks[name];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        cb = ref[i];
        results.push(cb(obj));
      }
      return results;
    };
    if (apiKey && baseUrl) {
      url = baseUrl.replace('https://', "https://api:" + apiKey + "@");
      url = url + "/messages";
      return ndx.email = {
        send: function(ctx, cb) {
          var message;
          if (process.env.EMAIL_OVERRIDE) {
            ctx.to = process.env.EMAIL_OVERRIDE;
          }
          if (!process.env.EMAIL_DISABLE) {
            message = {
              from: ctx.from || from,
              to: ctx.to,
              subject: fillTemplate(ctx.subject, ctx),
              html: jade.render(ctx.body, ctx)
            };
            return superagent.post(url).type('form').send(message).end(function(err, response) {
              if (err) {
                return safeCallback('error', {
                  message: message,
                  error: err
                });
              } else if (response) {
                return safeCallback('send', {
                  message: message
                });
              }
            });
          } else {
            return console.log('mail disabled');
          }
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=index.js.map
