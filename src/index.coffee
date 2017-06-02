'use strict'

superagent = require 'superagent'

module.exports = (ndx) ->
  console.log 'hi from ndx mailgun api'
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
  console.log 'apikey', apiKey, 'baseUrl', baseUrl
  if apiKey and baseUrl
    url = baseUrl.replace 'https://', "https://api:#{apiKey}@"
    console.log 'url', url
    ndx.email =
      send: (ctx, cb) ->
        console.log 'i want to send'
        if process.env.EMAIL_OVERRIDE
          ctx.to = process.env.EMAIL_OVERRIDE
        if not process.env.EMAIL_DISABLE
          message =
            from: ctx.from or from
            to: ctx.to
            subject: fillTemplate ctx.subject, ctx
            html: jade.render ctx.body, ctx
          console.log 'sending', message
          superagent.post url
          .type 'form'
          .send message
          .end (err, response) ->
            if err
              console.log err
            if response
              console.log response.body
        else
          console.log 'mail disabled'
  