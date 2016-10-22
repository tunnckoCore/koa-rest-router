# [koa-rest-router][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Most powerful, flexible and composable router for building enterprise RESTful APIs easily!

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

## Highlighs
- **production:** ready for and used in
- **composability:** grouping multiple resources and multiple routers
- **flexibility:** overriding controller and request methods, plus custom prefixes
- **compatibility:** accepts both old and modern middlewares without deprecation messages
- **powerful:** multiple routers on same [koa][] app - even can combine multiple routers
- **light:** not poluting your router instance and app - see `.loadMethods`
- **backward compatible:** works on koa v1 - use `.legacyMiddleware`
- **maintainability:** very small, beautiful, maintainable and commented codebase
- **stability:** strict semantic versioning and very well documented, based on [koa-better-router][]
- **open:** love PRs for features, issues and recipes - [Contribute a recipe?](#contributing-recipes) See the [recipes](https://github.com/tunnckoCore/koa-better-router/tree/master/recipes) of [koa-better-router][]

## Table of Contents
- [Quickstart](#quickstart)
  * [Controller methods mapping](#controller-methods-mapping)
  * [Overriding controller methods](#overriding-controller-methods)
  * [Overriding request methods](#overriding-request-methods)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  * [KoaRestRouter](#koarestrouter)
  * [.createResource](#createresource)
  * [.addResource](#addresource)
  * [.getResource](#getresource)
  * [.resource](#resource)
  * [.addResources](#addresources)
  * [.getResources](#getresources)
  * [.groupResources](#groupresources)
- [Related](#related)
- [Contributing](#contributing)
  * [Contributing Recipes](#contributing-recipes)

**ProTip:** Checkout [koa-better-router API](https://github.com/tunnckoCore/koa-better-router#api) too to know what more methods comes with this.

## Quickstart
> This router uses [koa-better-body][], so you should review its API documentation to get more info how the things are working and what more methods are exposed.

### Controller methods mapping
> In addition this router allows you to override the controller methods which will be used in certain route path.

**Defaults**

| Request method | Route path | Controller method |
| --- | --- | --- |
| GET | `/users` | `index` |
| GET | `/users/new ` | `new` |
| POST | `/users` | `create` |
| GET | `/users/:user` | `show` |
| GET | `/users/:user/edit` | `edit` |
| PUT | `/users/:user` | `update` |
| DELETE | `/users/:user` | `remove` |

**Example**

```js
let Router = require('koa-rest-router')
let router = Router()

router.resource('users', {
  // GET /users
  index: (ctx, next) => {},

  // GET /users/new
  new: (ctx, next) => {},

  // POST /users
  create: (ctx, next) => {},

  // GET /users/:user
  show: (ctx, next) => {},

  // GET /users/:user/edit
  edit: (ctx, next) => {},

  // PUT /users/:user
  update: (ctx, next) => {},

  // DELETE /users/:user
  remove: (ctx, next) => {}
})

let users = router.getResource('users')

console.log(users.length) // => 7
console.log(users) // => Array Route Objects

console.log(router.routes.length) // => 7
console.log(router.resources.length) // => 1
```

**Note:** Multiple middlewares can be passed on each. Also combining old and modern koa middlewares, so both generator functions and normal functions.

### Overriding controller methods
> You easily can override the defaults by passing `options.map` object with key/value pairs where the key represents the original, and value is a string containing the wanted override.

**Example**

```js
let router = require('koa-rest-router')()

let options = {
  map: {
    index: 'foo',
    new: 'bar',
    create: 'baz',
    show: 'qux',
  }
}

router.resource('users', {
  // GET /users
  foo: (ctx, next) => {},

  // GET /users/new
  bar: (ctx, next) => {},

  // POST /users
  baz: (ctx, next) => {},

  // GET /users/:user
  qux: (ctx, next) => {},

  // ... etc
}, options)
```

### Overriding request methods
> In some cases in guides the REST routes uses different request methods and that field is not clear enough. So every sane router should allow overriding such things, so we do it. By default for updating is used `PUT`, for deleting/removing is `DELETE`. You can override this methods to use `POST` instead, so ...

**Example**

```js
let router = require('koa-rest-router')()

let options = {
  methods: {
    put: 'POST'
  }  
}

router.resource('cats', {
  // POST /cats/:cat
  update: (ctx, next) => {}
}, options)
```

And you can combine both overriding variants, of course

**Example**

```js
let router = require('koa-rest-router')()

let options = {
  methods: {
    put: 'POST'
  },
  map: {
    update: 'foobar'
  }
}

router.resource('cats', {
  // POST /cats/:cat
  foobar: (ctx, next) => {}
}, options)
```

## Install
> Install with [npm](https://www.npmjs.com/)

```sh
$ npm i koa-rest-router --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
let router = require('koa-rest-router')()

// or

let Router = require('koa-rest-router')
let apiRouter = Router({ prefix: '/api/v1' })
```

## API

### [KoaRestRouter](index.js#L77)
> Initialize `KoaRestRouter` with optional `options`, directly passed to [koa-better-router][] and this package inherits it. So you have all methods and functionality from the awesome [koa-better-router][] middleware.

**Params**

* `[options]` **{Object}**: passed directly to [koa-better-router][], in addition we have 2 more options here.    
* `[options.methods]` **{Object}**: override request methods to be used    
* `[options.map]` **{Object}**: override controller methods to be called    

**Example**

```js
let Router = require('koa-rest-router')
let api = Router({ prefix: '/api/v1' })

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

let basic = Router() // prefix is `/` by default
basic.extend(api)

app.use(api.middleware())
app.use(basic.middleware())

app.listen(4444, () => {
  console.log('Open http://localhost:4444 and try')
  // will output 2x14 links
  // - 14 links on `/api/v1` prefix
  // - 14 links on `/` prefix
  api.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:4444${route.path}`)
  })
  basic.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:4444${route.path}`)
  })
})
```

### [.createResource](index.js#L190)
> Core method behind `.resource` for creating single resource with a `name`, but without adding it to `this.routes` array. You can override any defaults - default request methods and default controller methods, just by passing respectively `opts.methods` object and `opts.map` object. It uses [koa-better-router][]'s `.createRoute` under the hood.

**Params**

* `name` **{String|Object}**: name of the resource or `ctrl`    
* `ctrl` **{Object}**: controller object to be called on each endpoint, or `opts`    
* `opts` **{Object}**: optional, merged with options from constructor    
* `returns` **{KoaRestRouter}** `this`: instance for chaining  

**Example**

```js
let router = require('koa-rest-router')({
  prefix: '/api'
}).loadMethods()

// The server part
let body = require('koa-better-body')
let Koa = require('koa')
let app = new Koa()

// override request methods
let methods = {
  put: 'POST'
  del: 'POST'
}

// override controller methods
let map = {
  index: 'list',
  show: 'read',
  remove: 'destroy'
}

// create actual resource
let cats = router.createResource('cats', {
  list: [
    (ctx, next) => {
      ctx.body = `This is GET ${ctx.route.path} route with multiple middlewares`
      return next()
    },
    function * (next) {
      this.body = `${this.body} and combining old and modern middlewares.`
      yield next
    }
  ],
  read: (ctx, next) => {
    ctx.body = `This is ${ctx.route.path} route.`
    ctx.body = `${ctx.body} And param ":cat" is ${ctx.params.cat}.`
    ctx.body = `${ctx.body} By default this method is called "show".`
    return next()
  },
  update: [body, (ctx, next) => {
    ctx.body = `This method by default is triggered with PUT requests only.`
    ctx.body = `${ctx.body} But now it is from POST request.`
    return next()
  }, function * (next) => {
    this.body = `${this.body} Incoming data is`
    this.body = `${this.body} ${JSON.stringify(this.request.fields, null, 2)}`
    yield next
  }],
  destroy: (ctx, next) => {
    ctx.body = `This route should be called with DELETE request, by default.`
    ctx.body = `${ctx.body} But now it request is POST.`
    return next()
  }
}, {map: map, methods: methods})

console.log(cats)
// => array of "Route Objects"

// router.routes array is empty
console.log(router.getRoutes()) // => []

// register the resource
router.addResource(cats)

console.log(router.routes.length) // => 7
console.log(router.getRoutes().length) // => 7
console.log(router.getRoutes()) // or router.routes
// => array of "Route Objects"

app.use(router.middleware())

app.listen(5000, () => {
  console.log(`Server listening on http://localhost:5000`)
  console.log(`Try to open these routes:`)

  router.routes.forEach((route) => {
    console.log(`${route.method}` http://localhost:5000${route.path}`)
  }))
})
```

### [.addResource](index.js#L249)
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

console.log(api.getResource('dragons'))
// array of route objects
// => [
//   { prefix: '/', route: '/dragons', path: '/dragons', ... }
//   { prefix: '/', route: '/dragons/:dragon', path: '/dragons/:dragon', ... }
//   ... and 5 more routes
// ]
```

### [.getResource](index.js#L287)
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

### [.resource](index.js#L399)
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

### [.addResources](index.js#L412)

> Just an alias of [koa-better-router][]'s' `.addRoutes` method.

**Params**

* `...args` **{Array}**: any number of arguments (arrays of route objects)    
* `returns` **{KoaRestRouter}** `this`: instance for chaining  

### [.getResources](index.js#L450)
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

### [.groupResources](index.js#L517)
> Powerful method for grouping couple of resources into one resource endpoint. For example you have `/cats` and `/dogs` endpoints, but you wanna create `/cats/:cat/dogs/:dog` endpoint, so you can do such things with that. You can group infinite number of resources. Useful methods that gives you what you should pass as arguments here are `.createResource`, `.createRoute`, `.getResources`, `.getResource` and `.getRoutes`. **Note:** Be aware of that it replaces middlewares of `dest` with the middlewares of last `src`.

**Params**

* `dest` **{Array}**: array of _"Route Objects"_ or _"Resource Object"_ (both are arrays)    
* `src1` **{Array}**: array of _"Route Objects"_ or _"Resource Object"_ (both are arrays)    
* `src2` **{Array}**: array of _"Route Objects"_ or _"Resource Object"_ (both are arrays)    
* `returns` **{Array}**: new array with grouped resources  

**Example**

```js
let router = require('koa-rest-router')({ prefix: '/api/v3'})

let departments = router.createResource('departments')
let companies = router.createResource('companies')
let profiles = router.createResource('profiles')
let clients = router.createResource('clients')
let users = router.createResource('users')
let cats = router.createResource('cats')
let dogs = router.createResource('dogs')

// endpoint: /companies/:company/departments/:department
let one = router.groupResources(companies, departments)

// endpoint: /profiles/:profile/clients/:client/cats/:cat
let two = router.groupResources(profiles, clients, cats)

// crazy? huh, AWESOME!
// endpoint: /companies/:company/departments/:department/profiles/:profile/clients/:client/cats/:cat
let foo = router.groupResources(one, two)

// but actually just "register" `one` and `foo`
// so you WON'T have `/profiles/:profile/clients/:client/cats/:cat`
// endpoint in your API
router.addRoutes(one, foo)

// Server part
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())

app.listen(4000, () => {
  console.log(`Mega API server on http://localhost:4000`)
  console.log(`Checkout these routes:`)

  // it will output 14 links
  router.getRoutes().forEach((route) => {
    console.log(`${route.method} http://localhost:4000${route.path}`)
  })
})
```

## Related
- [koa-bel](https://www.npmjs.com/package/koa-bel): View engine for `koa` without any deps, built to be used with… [more](https://github.com/tunnckocore/koa-bel#readme) | [homepage](https://github.com/tunnckocore/koa-bel#readme "View engine for `koa` without any deps, built to be used with `bel`. Any other engines that can be written in `.js` files would work, too.")
- [koa-better-body](https://www.npmjs.com/package/koa-better-body): Full-featured [koa][] body parser! Support parsing text, buffer, json, json patch, json… [more](https://github.com/tunnckocore/koa-better-body#readme) | [homepage](https://github.com/tunnckocore/koa-better-body#readme "Full-featured [koa][] body parser! Support parsing text, buffer, json, json patch, json api, csp-report, multipart, form and urlencoded bodies. Works for koa@1, koa@2 and will work for koa@3.")
- [koa-better-ratelimit](https://www.npmjs.com/package/koa-better-ratelimit): Better, smaller, faster - koa middleware for limit request by ip, store… [more](https://github.com/tunnckoCore/koa-better-ratelimit) | [homepage](https://github.com/tunnckoCore/koa-better-ratelimit "Better, smaller, faster - koa middleware for limit request by ip, store in-memory.")
- [koa-better-router](https://www.npmjs.com/package/koa-better-router): Stable and lovely router for [koa][], using [path-match][]. Foundation for building powerful… [more](https://github.com/tunnckocore/koa-better-router#readme) | [homepage](https://github.com/tunnckocore/koa-better-router#readme "Stable and lovely router for [koa][], using [path-match][]. Foundation for building powerful, flexible and RESTful APIs easily.")
- [koa-better-serve](https://www.npmjs.com/package/koa-better-serve): Small, simple and correct serving of files, using [koa-send][] - nothing more. | [homepage](https://github.com/tunnckocore/koa-better-serve#readme "Small, simple and correct serving of files, using [koa-send][] - nothing more.")
- [koa-ip-filter](https://www.npmjs.com/package/koa-ip-filter): Middleware for [koa][] that filters IPs against glob patterns, RegExp, string or… [more](https://github.com/tunnckocore/koa-ip-filter#readme) | [homepage](https://github.com/tunnckocore/koa-ip-filter#readme "Middleware for [koa][] that filters IPs against glob patterns, RegExp, string or array of globs. Support custom `403 Forbidden` message and custom ID.")
- [nanomatch](https://www.npmjs.com/package/nanomatch): Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch… [more](https://github.com/jonschlinkert/nanomatch) | [homepage](https://github.com/jonschlinkert/nanomatch "Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash 4.3 wildcard support only (no support for exglobs, posix brackets or braces)")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/koa-rest-router/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

### Contributing Recipes
Recipes are just different use cases, written in form of README in human language. Showing some "Pro Tips" and tricks, answering common questions and so on. They look like [tests](./test.js), but in more readable and understandable way for humans - mostly for beginners that not reads or understand enough the README or API and tests.

- They are in form of folders in the root [`recipes/`](./recipes) folder: for example `recipes/[short-meaningful-recipe-name]/`.
- In recipe folder should exist `README.md` file
- In recipe folder there may have actual js files, too. And should be working.
- The examples from the recipe README.md should also exist as separate `.js` files.
- Examples in recipe folder also should be working and actual.

It would be great if you follow these steps when you want to _fix, update or create_ a recipes. :sunglasses:

- Title for recipe idea should start with `[recipe]`: for example`[recipe] my awesome recipe`
- Title for new recipe (PR) should also start with `[recipe]`.
- Titles of Pull Requests or Issues for fixing/updating some existing recipes should start with `[recipe-fix]`.

It will help a lot, thanks in advance! :yum:

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

[koa-better-body]: https://github.com/tunnckocore/koa-better-body