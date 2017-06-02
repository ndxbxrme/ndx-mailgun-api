(function() {
  'use strict';
  var superagent;

  superagent = require('superagent');

  module.exports = function(ndx) {
    var apiKey, baseUrl, callbacks, fillTemplate, safeCallback, url;
    console.log('hi from ndx mailgun api');
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
    console.log('apikey', apiKey, 'baseUrl', baseUrl);
    if (apiKey && baseUrl) {
      url = baseUrl.replace('https://', "https://api:" + apiKey + "@");
      url = url + "/messages";
      console.log('url', url);
      return ndx.email = {
        send: function(ctx, cb) {
          var message;
          console.log('i want to send');
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
            console.log('sending', message);
            return superagent.post(url).type('form').send(message).end(function(err, response) {
              if (err) {
                console.log(err);
              }
              if (response) {
                return console.log(response.body);
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
