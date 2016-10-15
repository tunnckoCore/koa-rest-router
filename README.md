# [koa-rest-router][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Most powerful, flexible and composable router for building enterprise RESTful APIs easily!

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

## Install

```
npm i koa-rest-router --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
let router = require('koa-rest-router')()

// or
let Router = require('koa-rest-router')
let apiRouter = Router({ prefix: '/api/v1' })
```

### [KoaRestRouter](index.js#L72)
> Initialize `KoaRestRouter` with optional `options`, directly passed to [koa-better-router][] and this package inherits it. So you have all methods and functionality from the awesome [koa-better-router][] middleware.

**Params**

* `[options]` **{Object}**: passed directly to [koa-better-router][], in addition we have 2 more options here.    
* `[options.methods]` **{Object}**: override request methods to be used    
* `[options.map]` **{Object}**: override controller methods to be called    

**Example**

```js
let router = require('koa-rest-router')
let api = router({ prefix: '/api/v1' })

// - can have multiples middlewares
// - can have both old and modern middlewares combined
api.resource('companies', {
  index: function (ctx, next) {},
  show: function (ctx, next) {},
  create: function (ctx, next) {}
  // ... and etc
})

console.log(api.routes.length) // 7
console.log(api.resources.length) // 1

api.resource('profiles', {
  index: function (ctx, next) {},
  show: function (ctx, next) {},
  create: function (ctx, next) {}
  // ... and etc
})

console.log(api.routes.length) // 14
console.log(api.resources.length) // 2

let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(api.middleware())
app.use(api.middleware({ prefix: '/' }))

app.listen(4444, () => {
  console.log('Open http://localhost:4444 and try')

  // will output 2x14 links
  // - 14 links on `/api/v1` prefix
  // - 14 links on `/` prefix
  api.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:4444${route.route}`)
  })
})
```

### [.addRoutes](index.js#L127)
> Concats any number of arguments (arrays of route objects) to the `this.routes` array. Think for it like registering routes/resources. Can be used in combination with `.createRoute`, `.createResource`, `.getResources` and the `.getResource` methods. We have `.addResources` method which is alias of this.

**Params**

* `...args` **{Array}**: any number of arguments (arrays of route objects)    
* `returns` **{KoaRestRouter}** `this`: instance for chaining  

**Example**

```js
let router = require('koa-rest-router')()

// returns Route Object
let foo = router.createRoute('GET', '/foo', function (ctx, next) {
  ctx.body = 'foobar'
  return next()
})
console.log(foo)

// returns Route Object
// each resource creates 7 routes
let users = router.createResource('users', {
  index: function (ctx, next) {}
  // ... etc
})
console.log(users)

console.log(router.routes.length) // 0
console.log(router.resources.length) // 1

router.addRoutes(foo, users)

console.log(router.routes.length) // 8
console.log(router.resources.length) // 1
```

### [.getRoutes](index.js#L159)
> Simple method that just returns `this.routes`, which is array of route objects.

* `returns` **{Array}**: array of route objects  

**Example**

```js
let router = require('koa-rest-router')()

// see `koa-better-router` for
// docs on this method
router.loadMethods()

console.log(router.routes.length) // 0
console.log(router.getRoutes().length) // 0

router.get('/foo', (ctx, next) => {})
router.get('/bar', (ctx, next) => {})

console.log(router.routes.length) // 2
console.log(router.getRoutes().length) // 2
```

### [.getResources](index.js#L201)
> As we have `.getRoutes` method for getting `this.routes`, so we have `.getResources` for getting `this.resources` array, too. Each `.createResource` returns array of route objects with length of 7, so 7 routes. So if you call `.createResource` two times the `this.resources` (what this method returns) will contain 2 arrays with 7 routes in each of them.

* `returns` **{Array}**: array of arrays of route objects  

**Example**

```js
let router = require('koa-rest-router')().loadMethods()

console.log(router.routes.length)          // 0
console.log(router.getRoutes().length)     // 0

console.log(router.resources.length)       // 0
console.log(router.getResources().length)  // 0

router.get('/about', (ctx, next) => {})
router.resource('dogs')
router.resource('cats')

console.log(router.routes.length)          // 15
console.log(router.getRoutes().length)     // 15

console.log(router.resources.length)       // 2
console.log(router.getResources().length)  // 2
```

### [.getResource](index.js#L239)
> Get single resource by `name`. Special case is resource to the `/` prefix. So pass `/` as `name`. See more on what are the _"Route Objects"_ in the [koa-better-router][] docs. What that method returns, I call _"Resource Object"_ - array of _"Route Objects"_

**Params**

* `name` **{String}**: name of the resource, plural    
* `returns` **{Array|Null}**: if resource with `name` not found `null, otherwise array of route objects - that array is known as Resource Object  

**Example**

```js
let api = require('koa-rest-router')({
  prefix: '/api/v2'
})

let frogs = api.createResource('frogs')
let dragons = api.createResource('dragons')

console.log(api.getResource('frogs'))
// array of route objects
// => [
//   { prefix: '/api/v2', route: '/frogs', path: '/api/v2/frogs', ... }
//   { prefix: '/api/v2', route: '/frogs/:frog', path: '/api/v2/frogs/:frog', ... }
//   ... and 5 more routes
// ]

console.log(api.getResources().length) // 2
```

### [.addResource](index.js#L285)
> Simple method that is alias of `.addRoutes` and `.addResources`, but for adding single resource. It can accepts only one `resource` object.

**Params**

* `resource` **{Array}**: array of route objects, known as _"Resource Object"_    
* `returns` **{KoaRestRouter}** `this`: instance for chaining  

**Example**

```js
let Router = require('koa-rest-router')
let api = new Router({
  prefix: '/'
})

console.log(api.resources.length) // 0
console.log(api.routes.length) // 0

api.addResource(api.createResource('dragons'))

console.log(api.resources.length) // 1
console.log(api.routes.length) // 7

console.log(api.getResouce('dragons'))
// array of route objects
// => [
//   { prefix: '/', route: '/dragons', path: '/dragons', ... }
//   { prefix: '/', route: '/dragons/:dragon', path: '/dragons/:dragon', ... }
//   ... and 5 more routes
// ]
```

### [.resource](index.js#L390)
> Creates a resource using `.createResource` and adds the resource routes to the `this.routes` array, using `.addResource`. This is not an alias! It is combination of two methods. Methods that are not defined in given `ctrl` (controller) returns by default `501 Not Implemented`. You can override any defaults - default request methods and default controller methods, just by passing respectively `opts.methods` object and `opts.map` object.

**Params**

* `name` **{String|Object}**: name of the resource or `ctrl`    
* `ctrl` **{Object}**: controller object to be called on each endpoint, or `opts`    
* `opts` **{Object}**: optional, merged with options from constructor    
* `returns` **{KoaRestRouter}** `this`: instance for chaining  

**Example**

```js
let Router = require('koa-rest-router')

let api = new Router({ prefix: '/api/v3' })
let router = new Router() // on `/` prefix by default

// All of the controller methods
// can be remap-ed. using `opts.map`
// try to pass `{ map: { index: 'home' } }` as options

api.resource('users', {
  // GET /users
  index: [(ctx, next) => {}, (ctx, next) => {}],

  // GET /users/new
  new: (ctx, next) => {},

  // POST /users
  create: (ctx, next) => {},

  // GET /users/:user
  show: [(ctx, next) => {}, function * (next) {}],

  // GET /users/:user/edit
  edit: (ctx, next) => {},

  // PUT /users/:user
  // that `PUT` can be changed `opts.methods.put: 'post'`
  update: (ctx, next) => {},

  // DELETE /users/:user
  // that `DELETE` can be changed `opts.methods.delete: 'post'`
  remove: (ctx, next) => {}
})

// notice the `foo` method
router.resource({
  // GET /
  foo: [
    (ctx, next) => {
      ctx.body = `GET ${ctx.route.path}`
      return next()
    },
    function * (next) {
      ctx.body = `${this.body}! Hello world!`
      yield next
    }
  ],
  // GET /:id, like /123
  show: (ctx, next) => {
    ctx.body = JSON.stringify(ctx.params, null, 2)
    return next()
  }
}, {
  map: {
    index: 'foo'
  }
})

api.routes.forEach(route => console.log(route.method, route.path))
router.routes.forEach(route => console.log(route.method, route.path))

// Wanna use only one router?
let fooRouter = new Router()
let Koa = require('koa')
let app = new Koa()

fooRouter.addRoutes(api.getResources(), router.getRoutes())

console.log(fooRouter.routes)
console.log(fooRouter.routes.length) // 14

app.use(fooRouter.middleware())

app.listen(4433, () => {
  console.log('Cool server started at 4433. Try these routes:')

  fooRouter.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:4433${route.path}`)
  })
})
```

## Related
- [koa-bel](https://www.npmjs.com/package/koa-bel): View engine for `koa` without any deps, built to be used with… [more](https://github.com/tunnckocore/koa-bel#readme) | [homepage](https://github.com/tunnckocore/koa-bel#readme "View engine for `koa` without any deps, built to be used with `bel`. Any other engines that can be written in `.js` files would work, too.")
- [koa-better-body](https://www.npmjs.com/package/koa-better-body): Full-featured [koa][] body parser! Support parsing text, buffer, json, json patch, json… [more](https://github.com/tunnckocore/koa-better-body#readme) | [homepage](https://github.com/tunnckocore/koa-better-body#readme "Full-featured [koa][] body parser! Support parsing text, buffer, json, json patch, json api, csp-report, multipart, form and urlencoded bodies. Works for koa@1, koa@2 and will work for koa@3.")
- [koa-better-ratelimit](https://www.npmjs.com/package/koa-better-ratelimit): Better, smaller, faster - koa middleware for limit request by ip, store… [more](https://github.com/tunnckoCore/koa-better-ratelimit) | [homepage](https://github.com/tunnckoCore/koa-better-ratelimit "Better, smaller, faster - koa middleware for limit request by ip, store in-memory.")
- [koa-better-router](https://www.npmjs.com/package/koa-better-router): Fast, simple, smart and correct routing for [koa][], using [path-match][]. Foundation for… [more](https://github.com/tunnckocore/koa-better-router#readme) | [homepage](https://github.com/tunnckocore/koa-better-router#readme "Fast, simple, smart and correct routing for [koa][], using [path-match][]. Foundation for building powerful, flexible and RESTful APIs easily.")
- [koa-better-serve](https://www.npmjs.com/package/koa-better-serve): Small, simple and correct serving of files, using [koa-send][] - nothing more. | [homepage](https://github.com/tunnckocore/koa-better-serve#readme "Small, simple and correct serving of files, using [koa-send][] - nothing more.")
- [koa-ip-filter](https://www.npmjs.com/package/koa-ip-filter): Middleware for [koa][] that filters IPs against glob patterns, RegExp, string or… [more](https://github.com/tunnckocore/koa-ip-filter#readme) | [homepage](https://github.com/tunnckocore/koa-ip-filter#readme "Middleware for [koa][] that filters IPs against glob patterns, RegExp, string or array of globs. Support custom `403 Forbidden` message and custom ID.")
- [nanomatch](https://www.npmjs.com/package/nanomatch): Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch… [more](https://github.com/jonschlinkert/nanomatch) | [homepage](https://github.com/jonschlinkert/nanomatch "Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash 4.3 wildcard support only (no support for exglobs, posix brackets or braces)")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/koa-rest-router/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

[koa-better-router]: https://github.com/tunnckocore/koa-better-router
[koa-send]: https://github.com/koajs/send
[koa]: https://github.com/koajs/koa
[path-match]: https://github.com/pillarjs/path-match

[npmjs-url]: https://www.npmjs.com/package/koa-rest-router
[npmjs-img]: https://img.shields.io/npm/v/koa-rest-router.svg?label=koa-rest-router

[license-url]: https://github.com/tunnckoCore/koa-rest-router/blob/master/LICENSE
[license-img]: https://img.shields.io/npm/l/koa-rest-router.svg

[downloads-url]: https://www.npmjs.com/package/koa-rest-router
[downloads-img]: https://img.shields.io/npm/dm/koa-rest-router.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/koa-rest-router
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/koa-rest-router.svg

[travis-url]: https://travis-ci.org/tunnckoCore/koa-rest-router
[travis-img]: https://img.shields.io/travis/tunnckoCore/koa-rest-router/master.svg

[coveralls-url]: https://coveralls.io/r/tunnckoCore/koa-rest-router
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/koa-rest-router.svg

[david-url]: https://david-dm.org/tunnckoCore/koa-rest-router
[david-img]: https://img.shields.io/david/tunnckoCore/koa-rest-router.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[author-www-url]: http://www.tunnckocore.tk
[author-www-img]: https://img.shields.io/badge/www-tunnckocore.tk-fe7d37.svg

[keybase-url]: https://keybase.io/tunnckocore
[keybase-img]: https://img.shields.io/badge/keybase-tunnckocore-8a7967.svg

[author-npm-url]: https://www.npmjs.com/~tunnckocore
[author-npm-img]: https://img.shields.io/badge/npm-~tunnckocore-cb3837.svg

[author-twitter-url]: https://twitter.com/tunnckoCore
[author-twitter-img]: https://img.shields.io/badge/twitter-@tunnckoCore-55acee.svg

[author-github-url]: https://github.com/tunnckoCore
[author-github-img]: https://img.shields.io/badge/github-@tunnckoCore-4183c4.svg

[freenode-url]: http://webchat.freenode.net/?channels=charlike
[freenode-img]: https://img.shields.io/badge/freenode-%23charlike-5654a4.svg

[new-message-url]: https://github.com/tunnckoCore/ama
[new-message-img]: https://img.shields.io/badge/ask%20me-anything-green.svg

