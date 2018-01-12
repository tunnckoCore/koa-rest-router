/*!
 * koa-rest-router <https://github.com/tunnckoCore/koa-rest-router>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

const request = require('supertest')
const test = require('mukla')
const Koa = require('koa')
const Router = require('./index')
const router = Router()

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
  test.strictEqual(typeof router.createResource, 'function')
  test.strictEqual(typeof router.addResource, 'function')
  test.strictEqual(typeof router.addResources, 'function')
  test.strictEqual(typeof router.getResource, 'function')
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

test('should get single resource by plural name - `.getResource(name)`', function (done) {
  let r = (new Router()).resource('foobar')
  let resource = r.getResource('foobars')

  test.strictEqual(typeof resource, 'object')
  test.strictEqual(Array.isArray(resource), true)
  test.strictEqual(resource.length, 7) // 7 Route Objects
  test.deepStrictEqual(resource[1].route, '/foobars/new')
  done()
})

test('should `.getResource` return null if not found', function (done) {
  let ro = Router().resource('foo')
  test.strictEqual(ro.getResources().length, 1)
  test.strictEqual(ro.getResource('bar'), null)
  done()
})

test('should get all resources using `.getResources`', function (done) {
  let ruter = Router({ prefix: '/api' })
  ruter.resource('dogs').createResource()

  let resources = ruter.getResources()
  test.strictEqual(Array.isArray(resources), true)
  test.strictEqual(resources.length, 2)
  test.strictEqual(resources[0].length, 7)
  test.strictEqual(resources[1].length, 7)
  test.strictEqual(resources[0][1].path, '/api/dogs/new')
  test.strictEqual(resources[0][1].route, '/dogs/new')
  test.strictEqual(resources[1][1].path, '/api/new')
  test.strictEqual(resources[1][1].route, '/new')
  test.strictEqual(ruter.resources[0][1].path, '/api/dogs/new')
  test.strictEqual(ruter.resources[1][1].path, '/api/new')
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

test('should got `501 Not Implemented` if ctrl method not implemented', function (done) {
  const r = new Router()
  const serv = new Koa()

  r.resource('fool', {
    index: (ctx, next) => {}
  })

  serv.use(r.middleware())
  request(serv.callback()).get('/fools/new').expect(501, /Not Implemented/)
    .end(done)
})

test('should group resources using `.groupResources`', function (done) {
  let server = new Koa()
  let apiRouter = new Router({
    prefix: '/api'
  })
  let companies = apiRouter.createResource('companies', {
    show: function * (next) {
      this.body = `companies: path is ${this.route.path}, haha`
      this.body = `${this.body}!! :company is ${this.params.company}, yea`
      yield next
    }
  })
  let profiles = apiRouter.createResource('profiles', {
    show: function (ctx, next) {
      return next()
    }
  })
  let cats = apiRouter.createResource('cats', {
    show: function (ctx, next) {
      ctx.body = `catsCtrl: path is ${ctx.route.path}, hoho`
      ctx.body = `${ctx.body} :company is ${ctx.params.company}`
      ctx.body = `${ctx.body} :profile is ${ctx.params.profile}`
      ctx.body = `${ctx.body} :cat is ${ctx.params.cat}`
      return next()
    }
  })

  test.strictEqual(apiRouter.resources.length, 3)
  test.strictEqual(apiRouter.routes.length, 0)
  test.strictEqual(companies.length, 7)
  test.strictEqual(profiles.length, 7)
  test.strictEqual(cats.length, 7)

  let resource = apiRouter.groupResources(companies, profiles, cats)

  test.strictEqual(apiRouter.resources.length, 3)
  test.strictEqual(apiRouter.routes.length, 0)
  test.strictEqual(resource.length, 7)

  // method `.addResource` works too
  apiRouter.addResources(resource)

  test.strictEqual(apiRouter.resources.length, 3)
  test.strictEqual(apiRouter.routes.length, 7)

  server.use(apiRouter.middleware())
  request(server.callback())
    .get('/api/companies/foo')
    // we don't have `/api/companies` routes
    // we don't have `/api/comapnies/:company/profiles/:profile` routes
    // but we have `/companies/:company/profiles/:profile/cats` routes
    .expect(404, function (err) {
      test.ifError(err)

      request(server.callback())
        .get('/api/companies/foo/profiles/bar')
        .expect(404).end(function () {
          request(server.callback())
            .get('/api/companies/foo/profiles/bar/cats/qux')
            .expect(/:company is foo/)
            .expect(/:profile is bar/)
            .expect(/:cat is qux/)
            .expect(200, /catsCtrl: path is/)
            .end(done)
        })
    })
})

test('should generate correct routes using `.groupResources` for a default prefix', function () {
  let apiRouter = new Router()
  let companies = apiRouter.createResource('companies')
  let profiles = apiRouter.createResource('profiles')

  let resource = apiRouter.groupResources(companies, profiles)

  test.strictEqual(resource[0].path, '/companies/:company/profiles')
  test.strictEqual(resource[1].path, '/companies/:company/profiles/new')
  test.strictEqual(resource[2].path, '/companies/:company/profiles')
  test.strictEqual(resource[3].path, '/companies/:company/profiles/:profile')
  test.strictEqual(resource[4].path, '/companies/:company/profiles/:profile/edit')
  test.strictEqual(resource[5].path, '/companies/:company/profiles/:profile')
})

test('should generate correct routes using `.groupResources` for a custom prefix', function () {
  let apiRouter = new Router({ prefix: '/api' })
  let companies = apiRouter.createResource('companies')
  let profiles = apiRouter.createResource('profiles')

  let resource = apiRouter.groupResources(companies, profiles)

  test.strictEqual(resource[0].path, '/api/companies/:company/profiles')
  test.strictEqual(resource[1].path, '/api/companies/:company/profiles/new')
  test.strictEqual(resource[2].path, '/api/companies/:company/profiles')
  test.strictEqual(resource[3].path, '/api/companies/:company/profiles/:profile')
  test.strictEqual(resource[4].path, '/api/companies/:company/profiles/:profile/edit')
  test.strictEqual(resource[5].path, '/api/companies/:company/profiles/:profile')
})

test('should be able to re-map controller methods through opitons', function (done) {
  let options = {
    map: {
      edit: 'foo'
    }
  }
  let api = Router({ prefix: '/api' })
  api.resource('companies', {
    foo: function (ctx, next) {
      ctx.body = `Hello world! Edit company ${ctx.params.company}.`
      ctx.body = `${ctx.body} Path: ${ctx.route.path}`
      return next()
    }
  }, options)
  let app = new Koa()

  app.use(api.middleware())
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
  let kkk = new Koa()
  let api = new Router()
  api.resource({
    new: function * (next) {
      this.body = `Normally this is called with GET request`
      this.body = `${this.body}, but now it is called with POST request`
      yield next
    }
  }, options)

  kkk.use(api.middleware())
  request(kkk.callback())
    .post('/new')
    .send({ foo: 'bar' })
    .expect(/Normally this is called with GET request/)
    .expect(/but now it is called with POST request/)
    .expect(200, done)
})
