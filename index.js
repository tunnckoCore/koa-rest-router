/*!
 * koa-rest-router <https://github.com/tunnckoCore/koa-rest-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

let util = require('util')
let utils = require('./utils')

/**
 * > Initialize `KoaRestRouter` with optional `options`,
 * directly passed to [koa-better-router][] and this package
 * inherits it. So you have all methods and functionality from
 * the awesome [koa-better-router][] middleware.
 *
 * **Example**
 *
 * ```js
 * let Router = require('koa-rest-router')
 * let api = Router({ prefix: '/api/v1' })
 *
 * // - can have multiples middlewares
 * // - can have both old and modern middlewares combined
 * api.resource('companies', {
 *   index: function (ctx, next) {},
 *   show: function (ctx, next) {},
 *   create: function (ctx, next) {}
 *   // ... and etc
 * })
 *
 * console.log(api.routes.length) // 7
 * console.log(api.resources.length) // 1
 *
 * api.resource('profiles', {
 *   index: function (ctx, next) {},
 *   show: function (ctx, next) {},
 *   create: function (ctx, next) {}
 *   // ... and etc
 * })
 *
 * console.log(api.routes.length) // 14
 * console.log(api.resources.length) // 2
 *
 * let Koa = require('koa') // Koa v2
 * let app = new Koa()
 *
 * let basic = Router() // prefix is `/` by default
 * basic.extend(api)
 *
 * app.use(api.middleware())
 * app.use(basic.middleware())
 *
 * app.listen(4444, () => {
 *   console.log('Open http://localhost:4444 and try')
 *   // will output 2x14 links
 *   // - 14 links on `/api/v1` prefix
 *   // - 14 links on `/` prefix
 *   api.routes.forEach((route) => {
 *     console.log(`${route.method} http://localhost:4444${route.path}`)
 *   })
 *   basic.routes.forEach((route) => {
 *     console.log(`${route.method} http://localhost:4444${route.path}`)
 *   })
 * })
 * ```
 *
 * @param {Object} `[options]` passed directly to [koa-better-router][],
 *                             in addition we have 2 more options here.
 * @param {Object} `[options.methods]` override request methods to be used
 * @param {Object} `[options.map]` override controller methods to be called
 * @api public
 */

function KoaRestRouter (options) {
  if (!(this instanceof KoaRestRouter)) {
    return new KoaRestRouter(options)
  }
  utils.Router.call(this, utils.mergeOptions({
    methods: utils.defaultRequestMethods,
    map: utils.defaultControllerMap
  }, options))
  this.resources = []
}

util.inherits(KoaRestRouter, utils.Router)

/**
 * > Core method behind `.resource` for creating single
 * resource with a `name`, but without adding it to `this.routes` array.
 * You can override any defaults - default request methods and
 * default controller methods, just by passing
 * respectively `opts.methods` object and `opts.map` object.
 * It uses [koa-better-router][]'s `.createRoute` under the hood.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-rest-router')({
 *   prefix: '/api'
 * }).loadMethods()
 *
 * // The server part
 * let body = require('koa-better-body')
 * let Koa = require('koa')
 * let app = new Koa()
 *
 * // override request methods
 * let methods = {
 *   put: 'POST'
 *   del: 'POST'
 * }
 *
 * // override controller methods
 * let map = {
 *   index: 'list',
 *   show: 'read',
 *   remove: 'destroy'
 * }
 *
 * // create actual resource
 * let cats = router.createResource('cats', {
 *   list: [
 *     (ctx, next) => {
 *       ctx.body = `This is GET ${ctx.route.path} route with multiple middlewares`
 *       return next()
 *     },
 *     function * (next) {
 *       this.body = `${this.body} and combining old and modern middlewares.`
 *       yield next
 *     }
 *   ],
 *   read: (ctx, next) => {
 *     ctx.body = `This is ${ctx.route.path} route.`
 *     ctx.body = `${ctx.body} And param ":cat" is ${ctx.params.cat}.`
 *     ctx.body = `${ctx.body} By default this method is called "show".`
 *     return next()
 *   },
 *   update: [body, (ctx, next) => {
 *     ctx.body = `This method by default is triggered with PUT requests only.`
 *     ctx.body = `${ctx.body} But now it is from POST request.`
 *     return next()
 *   }, function * (next) => {
 *     this.body = `${this.body} Incoming data is`
 *     this.body = `${this.body} ${JSON.stringify(this.request.fields, null, 2)}`
 *     yield next
 *   }],
 *   destroy: (ctx, next) => {
 *     ctx.body = `This route should be called with DELETE request, by default.`
 *     ctx.body = `${ctx.body} But now it request is POST.`
 *     return next()
 *   }
 * }, {map: map, methods: methods})
 *
 * console.log(cats)
 * // => array of "Route Objects"
 *
 * // router.routes array is empty
 * console.log(router.getRoutes()) // => []
 *
 * // register the resource
 * router.addResource(cats)
 *
 * console.log(router.routes.length) // => 7
 * console.log(router.getRoutes().length) // => 7
 * console.log(router.getRoutes()) // or router.routes
 * // => array of "Route Objects"
 *
 * app.use(router.middleware())
 *
 * app.listen(5000, () => {
 *   console.log(`Server listening on http://localhost:5000`)
 *   console.log(`Try to open these routes:`)
 *
 *   router.routes.forEach((route) => {
 *     console.log(`${route.method}` http://localhost:5000${route.path}`)
 *   }))
 * })
 * ```
 *
 * @param  {String|Object} `name` name of the resource or `ctrl`
 * @param  {Object} `ctrl` controller object to be called on each endpoint, or `opts`
 * @param  {Object} `opts` optional, merged with options from constructor
 * @return {KoaRestRouter} `this` instance for chaining
 * @api public
 */

KoaRestRouter.prototype.createResource = function createResource (name, ctrl, opts) {
  if (typeof name === 'object') {
    opts = ctrl
    ctrl = name
    name = '/'
  }
  if (typeof name !== 'string') {
    name = '/'
  }

  let _name = name[0] === '/' ? name.slice(1) : name
  let route = name !== '/' ? utils.inflection.pluralize(_name) : ''
  let param = name !== '/' ? ':' + utils.inflection.singularize(_name) : ':id'
  let src = utils.createResourceRoutes(route, param, ctrl)(this, opts)

  // add them to cache
  src.name = route === '' ? '/' : route
  this.resources.push(src)

  // just return them without
  // adding them to `this.routes`
  return src
}

/**
 * > Simple method that is alias of `.addRoutes` and `.addResources`,
 * but for adding single resource.
 * It can accepts only one `resource` object.
 *
 * **Example**
 *
 * ```js
 * let Router = require('koa-rest-router')
 * let api = new Router({
 *   prefix: '/'
 * })
 *
 * console.log(api.resources.length) // 0
 * console.log(api.routes.length) // 0
 *
 * api.addResource(api.createResource('dragons'))
 *
 * console.log(api.resources.length) // 1
 * console.log(api.routes.length) // 7
 *
 * console.log(api.getResource('dragons'))
 * // array of route objects
 * // => [
 * //   { prefix: '/', route: '/dragons', path: '/dragons', ... }
 * //   { prefix: '/', route: '/dragons/:dragon', path: '/dragons/:dragon', ... }
 * //   ... and 5 more routes
 * // ]
 * ```
 *
 * @param {Array} `resource` array of route objects, known as _"Resource Object"_
 * @return {KoaRestRouter} `this` instance for chaining
 * @api public
 */

KoaRestRouter.prototype.addResource = function addResource (resource) {
  return this.addRoutes(resource)
}

/**
 * > Get single resource by `name`. Special case is resource
 * to the `/` prefix. So pass `/` as `name`. See more on what
 * are the _"Route Objects"_ in the [koa-better-router][] docs.
 * What that method returns, I call _"Resource Object"_ - array
 * of _"Route Objects"_
 *
 * **Example**
 *
 * ```js
 * let api = require('koa-rest-router')({
 *   prefix: '/api/v2'
 * })
 *
 * let frogs = api.createResource('frogs')
 * let dragons = api.createResource('dragons')
 *
 * console.log(api.getResource('frogs'))
 * // array of route objects
 * // => [
 * //   { prefix: '/api/v2', route: '/frogs', path: '/api/v2/frogs', ... }
 * //   { prefix: '/api/v2', route: '/frogs/:frog', path: '/api/v2/frogs/:frog', ... }
 * //   ... and 5 more routes
 * // ]
 *
 * console.log(api.getResources().length) // 2
 * ```
 *
 * @param  {String} `name` name of the resource, plural
 * @return {Array|Null} if resource with `name` not found `null, otherwise
 *    array of route objects - that array is known as Resource Object
 * @api public
 */

KoaRestRouter.prototype.getResource = function getResource (name) {
  let res = null
  for (let resource of this.resources) {
    if (resource.name === name) {
      res = resource
      break
    }
  }
  return res
}

/**
 * > Creates a resource using `.createResource` and adds
 * the resource routes to the `this.routes` array, using `.addResource`.
 * This is not an alias! It is combination of two methods. Methods
 * that are not defined in given `ctrl` (controller) returns
 * by default `501 Not Implemented`. You can override any
 * defaults - default request methods and default controller methods,
 * just by passing respectively `opts.methods` object and `opts.map` object.
 *
 * **Example**
 *
 * ```js
 * let Router = require('koa-rest-router')
 *
 * let api = new Router({ prefix: '/api/v3' })
 * let router = new Router() // on `/` prefix by default
 *
 * // All of the controller methods
 * // can be remap-ed. using `opts.map`
 * // try to pass `{ map: { index: 'home' } }` as options
 *
 * api.resource('users', {
 *   // GET /users
 *   index: [(ctx, next) => {}, (ctx, next) => {}],
 *
 *   // GET /users/new
 *   new: (ctx, next) => {},
 *
 *   // POST /users
 *   create: (ctx, next) => {},
 *
 *   // GET /users/:user
 *   show: [(ctx, next) => {}, function * (next) {}],
 *
 *   // GET /users/:user/edit
 *   edit: (ctx, next) => {},
 *
 *   // PUT /users/:user
 *   // that `PUT` can be changed `opts.methods.put: 'post'`
 *   update: (ctx, next) => {},
 *
 *   // DELETE /users/:user
 *   // that `DELETE` can be changed `opts.methods.delete: 'post'`
 *   remove: (ctx, next) => {}
 * })
 *
 * // notice the `foo` method
 * router.resource({
 *   // GET /
 *   foo: [
 *     (ctx, next) => {
 *       ctx.body = `GET ${ctx.route.path}`
 *       return next()
 *     },
 *     function * (next) {
 *       ctx.body = `${this.body}! Hello world!`
 *       yield next
 *     }
 *   ],
 *   // GET /:id, like /123
 *   show: (ctx, next) => {
 *     ctx.body = JSON.stringify(ctx.params, null, 2)
 *     return next()
 *   }
 * }, {
 *   map: {
 *     index: 'foo'
 *   }
 * })
 *
 * api.routes.forEach(route => console.log(route.method, route.path))
 * router.routes.forEach(route => console.log(route.method, route.path))
 *
 * // Wanna use only one router?
 * let fooRouter = new Router()
 * let Koa = require('koa')
 * let app = new Koa()
 *
 * fooRouter.addRoutes(api.getResources(), router.getRoutes())
 *
 * console.log(fooRouter.routes)
 * console.log(fooRouter.routes.length) // 14
 *
 * app.use(fooRouter.middleware())
 *
 * app.listen(4433, () => {
 *   console.log('Cool server started at 4433. Try these routes:')
 *
 *   fooRouter.routes.forEach((route) => {
 *     console.log(`${route.method} http://localhost:4433${route.path}`)
 *   })
 * })
 * ```
 *
 * @param  {String|Object} `name` name of the resource or `ctrl`
 * @param  {Object} `ctrl` controller object to be called on each endpoint, or `opts`
 * @param  {Object} `opts` optional, merged with options from constructor
 * @return {KoaRestRouter} `this` instance for chaining
 * @api public
 */

KoaRestRouter.prototype.resource = function resource_ (name, ctrl, opts) {
  let resource = this.createResource.apply(this, arguments)
  return this.addResource(resource)
}

/**
 * > Just an alias of [koa-better-router][]'s' `.addRoutes` method.
 *
 * @param {Array} `...args` any number of arguments (arrays of route objects)
 * @return {KoaRestRouter} `this` instance for chaining
 * @api public
 */

KoaRestRouter.prototype.addResources = function addResources () {
  return this.addRoutes.apply(this, arguments)
}

/**
 * > As we have `.getRoutes` method for getting `this.routes`,
 * so we have `.getResources` for getting `this.resources` array, too.
 * Each `.createResource` returns array of route objects with length of 7,
 * so 7 routes. So if you call `.createResource` two times
 * the `this.resources` (what this method returns) will contain 2 arrays
 * with 7 routes in each of them.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-rest-router')().loadMethods()
 *
 * console.log(router.routes.length)          // 0
 * console.log(router.getRoutes().length)     // 0
 *
 * console.log(router.resources.length)       // 0
 * console.log(router.getResources().length)  // 0
 *
 * router.get('/about', (ctx, next) => {})
 * router.resource('dogs')
 * router.resource('cats')
 *
 * console.log(router.routes.length)          // 15
 * console.log(router.getRoutes().length)     // 15
 *
 * console.log(router.resources.length)       // 2
 * console.log(router.getResources().length)  // 2
 * ```
 *
 * @return {Array} array of arrays of route objects
 * @api public
 */

KoaRestRouter.prototype.getResources = function getResources () {
  return this.resources
}

/**
 * > Powerful method for grouping couple of resources into
 * one resource endpoint. For example you have `/cats` and `/dogs`
 * endpoints, but you wanna create `/cats/:cat/dogs/:dog` endpoint,
 * so you can do such things with that. You can group infinite
 * number of resources. Useful methods that gives you what you
 * should pass as arguments here are `.createResource`, `.createRoute`,
 * `.getResources`, `.getResource` and `.getRoutes`.
 * **Note:** Be aware of that it replaces middlewares of `dest`
 * with the middlewares of last `src`.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-rest-router')({ prefix: '/api/v3'})
 *
 * let departments = router.createResource('departments')
 * let companies = router.createResource('companies')
 * let profiles = router.createResource('profiles')
 * let clients = router.createResource('clients')
 * let users = router.createResource('users')
 * let cats = router.createResource('cats')
 * let dogs = router.createResource('dogs')
 *
 * // endpoint: /companies/:company/departments/:department
 * let one = router.groupResources(companies, departments)
 *
 * // endpoint: /profiles/:profile/clients/:client/cats/:cat
 * let two = router.groupResources(profiles, clients, cats)
 *
 * // crazy? huh, AWESOME!
 * // endpoint: /companies/:company/departments/:department/profiles/:profile/clients/:client/cats/:cat
 * let foo = router.groupResources(one, two)
 *
 * // but actually just "register" `one` and `foo`
 * // so you WON'T have `/profiles/:profile/clients/:client/cats/:cat`
 * // endpoint in your API
 * router.addRoutes(one, foo)
 *
 * // Server part
 * let Koa = require('koa')
 * let app = new Koa()
 *
 * app.use(router.middleware())
 *
 * app.listen(4000, () => {
 *   console.log(`Mega API server on http://localhost:4000`)
 *   console.log(`Checkout these routes:`)
 *
 *   // it will output 14 links
 *   router.getRoutes().forEach((route) => {
 *     console.log(`${route.method} http://localhost:4000${route.path}`)
 *   })
 * })
 * ```
 *
 * @param  {Array} `dest` array of _"Route Objects"_ or _"Resource Object"_ (both are arrays)
 * @param  {Array} `src1` array of _"Route Objects"_ or _"Resource Object"_ (both are arrays)
 * @param  {Array} `src2` array of _"Route Objects"_ or _"Resource Object"_ (both are arrays)
 * @return {Array} new array with grouped resources
 * @api public
 */

KoaRestRouter.prototype.groupResources = function groupResources (dest, src1, src2) {
  return dest.map((destRoute, index) => {
    let route = utils.updateRoute(this, destRoute)
    route = this.groupRoutes(route, src1[index])

    /* istanbul ignore next */
    return src2 && Array.isArray(src2)
      ? this.groupRoutes(utils.updateRoute(this, route), src2[index])
      : route
  })
}

/**
 * Expose `KoaRestRouter` constructor
 *
 * @type {Function}
 * @api private
 */

module.exports = KoaRestRouter
