'use strict'

superagent = require 'superagent'
jade = require 'jade'

module.exports = (ndx) ->
  apiKey = process.env.EMAIL_API_KEY or ndx.settings.EMAIL_API_KEY
  baseUrl = process.env.EMAIL_BASE_URL or ndx.settings.EMAIL_BASE_URL
  fillTemplate = (template, data) ->
    template.replace /\{\{(.+?)\}\}/g, (all, match) ->
      evalInContext = (str, context) ->
        (new Function("with(this) {return #{str}}"))
        .call context
      evalInContext match, data
  callbacks = 
    send: []
    error: []
  safeCallback = (name, obj) ->
    for cb in callbacks[name]
      cb obj
  if apiKey and baseUrl
    url = baseUrl.replace 'https://', "https://api:#{apiKey}@"
    url = "#{url}/messages"
    ndx.email =
      send: (ctx, cb) ->
        if process.env.EMAIL_OVERRIDE
          ctx.to = process.env.EMAIL_OVERRIDE
        if not process.env.EMAIL_DISABLE
          try
            message =
              from: ctx.from or from
              to: ctx.to
              subject: fillTemplate ctx.subject, ctx
              html: jade.render ctx.body, ctx
            superagent.post url
            .type 'form'
            .send message
            .end (err, response) ->
              if err
                safeCallback 'error', 
                  message: message
                  error: err
              else if response
                safeCallback 'send',
                  message: message
          catch (e) ->
            safeCallback 'error',
              error: e
        else
          console.log 'mail disabled'
  