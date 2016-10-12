/*!
 * koa-rest-router <https://github.com/tunnckoCore/koa-rest-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var Koa = require('koa')
var Router = require('./index').Router
var Resource = require('./index').RestRouter

var app = new Koa()

var router = Router()
router.get('/', function (ctx, next) {
  ctx.body = 'foobar'
  return next()
})
app.use(router.routes())
app.use(router.allowedMethods())

var homeRouter = new Resource({
  index: function (ctx, next) {
    ctx.body = 'home: index GET /'
    return next()
  },
  new: function (ctx, next) {
    ctx.body = 'home: new GET /new'
    return next()
  },
  show: function (ctx, next) {
    ctx.body = 'home: show GET /' + ctx.params.id
    return next()
  }
})
app.use(homeRouter.rest())

var users = new Resource('users', {
  index: function (ctx, next) {
    ctx.body = 'users: index: GET /users'
    return next()
  },
  show: function (ctx, next) {
    ctx.body = 'users: show: GET /users/' + ctx.params.user
    return next()
  }
})
app.use(users.rest())

app.listen(4291, function () {
  console.log(`Server on http://localhost:4291`)
})
