/*!
 * koa-rest-router <https://github.com/tunnckoCore/koa-rest-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

let request = require('supertest')
let test = require('mukla')
let Koa = require('koa')
let Router = require('./index')
let router = Router()
let app = new Koa()

test('should expose constructor', function (done) {
  test.strictEqual(typeof Router, 'function')
  test.strictEqual(typeof Router(), 'object')
  test.strictEqual(typeof (new Router()), 'object')
  test.strictEqual(typeof router, 'object')
  done()
})

test('should have `koa-better-router` methods', function (done) {
  test.strictEqual(typeof router.createRoute, 'function')
  test.strictEqual(typeof router.addRoute, 'function')
  test.strictEqual(typeof router.getRoute, 'function')
  test.strictEqual(typeof router.addRoutes, 'function')
  test.strictEqual(typeof router.getRoutes, 'function')
  test.strictEqual(typeof router.groupRoutes, 'function')
  test.strictEqual(typeof router.loadMethods, 'function')
  test.strictEqual(typeof router.middleware, 'function')
  test.strictEqual(typeof router.legacyMiddleware, 'function')
  done()
})

test('should not have the HTTP verbs as methods if not `.loadMethods` called', function (done) {
  test.strictEqual(router.get, undefined)
  test.strictEqual(router.put, undefined)
  test.strictEqual(router.del, undefined)
  test.strictEqual(router.post, undefined)
  test.strictEqual(router.patch, undefined)
  test.strictEqual(router.delete, undefined)
  done()
})

test('should have HTTP verbs as methods when `.loadMethods` is called', function (done) {
  let api = Router({ prefix: '/api' })
  api.loadMethods()
  test.strictEqual(typeof api.put, 'function')
  test.strictEqual(typeof api.get, 'function')
  test.strictEqual(typeof api.post, 'function')
  test.strictEqual(typeof api.patch, 'function')
  done()
})

test('should have `.route` method (path-match matcher) on instance', function (done) {
  test.strictEqual(typeof router.route, 'function')
  done()
})

test('should have empty `.routes` array on initialization', function (done) {
  test.strictEqual(Array.isArray(router.routes), true)
  test.strictEqual(router.routes.length, 0)
  done()
})

test('should have empty array `.resources` on init', function (done) {
  let r = new Router()
  let isArr = Array.isArray(r.resources)
  test.strictEqual(isArr, true)
  test.strictEqual(r.resources.length, 0)
  done()
})

test('should `.addRoute` throw TypeError if `method` a string', function (done) {
  function fixture () {
    router.addRoute(123)
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `method` to be a string/)
  done()
})

test('should `.addRoute` throw TypeError route not a string, array or function', function (done) {
  function fixture () {
    router.addRoute('GET', 123)
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `route` be string, array or function/)
  done()
})

test('should create REST 7 routes and 1 resource using `.resource` method', function (done) {
  let routerSelf = Router().resource('users')
  test.strictEqual(routerSelf.resources.length, 1)
  test.strictEqual(routerSelf.routes.length, 7)
  routerSelf.resource('cats')
  test.strictEqual(routerSelf.resources.length, 2)
  test.strictEqual(routerSelf.routes.length, 14)
  done()
})

test('should be able to re-map controller methods through opitons', function (done) {
  let options = {
    map: {
      edit: 'foo'
    }
  }
  let api = Router()
  api.resource('companies', {
    foo: function (ctx, next) {
      ctx.body = `Hello world! Edit company ${ctx.params.company}.`
      ctx.body = `${ctx.body} Path: ${ctx.route.path}`
      return next()
    }
  }, options)
  let app = new Koa()

  app.use(api.middleware({ prefix: '/api' }))

  request(app.callback()).get('/api/companies/123/edit').expect(/Hello world!/)
    .expect(200, /Edit company 123/)
    .end(done)
})

test('should be able to re-map request methods through options', function (done) {
  let options = {
    methods: {
      get: 'post'
    }
  }
  let api = Router()
  api.resource({
    new: function * (next) {
      this.body = `Normally this is called with GET request`
      this.body = `${this.body}, but now it is called with POST request`
      yield next
    }
  }, options)

  app.use(api.middleware())
  request(app.callback())
    .post('/new')
    .send({ foo: 'bar' })
    .expect(200, /Normally this is called with GET request/)
    .expect(/but now it is called with POST request/)
    .end(done)
})

// test('should group two resources using `.group`', function (done) {
//   let server = new Koa()
//   let apiRouter = new Router({
//     prefix: '/api'
//   })
//   let companies = apiRouter.createResource('companies', {
//     show: function * (next) {
//       this.body = `path is ${this.route.path}, haha`
//       this.body = `${this.body}!! :company is ${this.params.company}, yea`
//       yield next
//     }
//   })
//   let profiles = apiRouter.createResource('profiles', {
//     show: function (ctx, next) {
//       ctx.body = `path is ${ctx.route.path}, hoho`
//       ctx.body = `${ctx.body} profile is ${ctx.params.profile}, wohoo`
//       return next()
//     }
//   })

//   test.strictEqual(apiRouter.resources.length, 2)
//   test.strictEqual(apiRouter.routes.length, 0)
//   test.strictEqual(companies.length, 7)
//   test.strictEqual(profiles.length, 7)

//   // creates /api/companies/:company/profiles/:profile
//   let resource = apiRouter.group(companies, profiles)
//   test.strictEqual(apiRouter.resources.length, 2)
//   test.strictEqual(apiRouter.routes.length, 0)
//   test.strictEqual(resource.length, 7)

//   apiRouter.addResource(resource)
//   console.log(apiRouter.routes)
//   // or
//   // apiRouter.addRoutes(resource)

//   server.use(apiRouter.middleware())
//   request(server.callback())
//     .get('/api/companies/foo')
//     .expect(/path is \/api\/companies\/:company, haha/)
//     .expect(/:company is foo, yea/)
//     .expect(200, function (err) {
//       test.ifError(err)

//       request(app.callback())
//         .get('/api/companies/22/profiles')
//         // .expect(200, /path is \/api\/profiles\/:profile, hoho/)
//         // .expect(/profile is 333, wohoo/)
//         .expect(501)
//         .end(function (err) {
//           test.ifError(err)
//           done()
//           // request(app.callback())
//           //   .get('/api/companies/22/profiles/55')
//           //   .expect(/path is \/api\/companies\/:company\/profiles\/:profile, haha/)
//           //   .expect(200, /profile is 55, wohoo/)
//           //   .end(done)
//         })
//     })
// })
