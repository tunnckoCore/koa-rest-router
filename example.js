'use strict'

let Koa = require('koa')
let Router = require('./index')
let app = new Koa()

let apiRouter = new Router({
  prefix: '/api/v1'
})

let companies = apiRouter.createResource('companies', {
  show: function * (next) {
    this.body = `path is ${this.route.path}, haha`
    this.body = `${this.body}!! :company is ${this.params.company}, yea`
    yield next
  }
})
let profiles = apiRouter.createResource('profiles', {
  show: function (ctx, next) {
    ctx.body = `path is ${ctx.route.path}, hoho`
    ctx.body = `${ctx.body} profile is ${ctx.params.profile}, wohoo`
    ctx.body = `${ctx.body} ${JSON.stringify(ctx.params, null, 2)}`
    return next()
  }
})
let users = apiRouter.createResource('users', {
  show: function (ctx, next) {
    ctx.body = `path is ${ctx.route.path}, hoho`
    ctx.body = `${ctx.body} profile is ${ctx.params.profile}, wohoo`
    ctx.body = `${ctx.body} ${JSON.stringify(ctx.params, null, 2)}`
    return next()
  }
})
let docs = apiRouter.createResource('docs', {
  show: function (ctx, next) {
    ctx.body = `path is ${ctx.route.path}, hoho`
    ctx.body = `${ctx.body} profile is ${ctx.params.profile}, wohoo`
    ctx.body = `${ctx.body} ${JSON.stringify(ctx.params, null, 2)}`
    return next()
  }
})
let bars = apiRouter.createResource('bars', {
  show: function (ctx, next) {
    ctx.body = `path is ${ctx.route.path}, hoho`
    ctx.body = `${ctx.body} profile is ${ctx.params.profile}, wohoo`
    ctx.body = `${ctx.body} ${JSON.stringify(ctx.params, null, 2)}`
    return next()
  }
})
let cats = apiRouter.createResource('cats', {
  show: function (ctx, next) {
    ctx.body = `path is ${ctx.route.path}, hoho`
    ctx.body = `${ctx.body} profile is ${ctx.params.profile}, wohoo`
    ctx.body = `${ctx.body} ${JSON.stringify(ctx.params, null, 2)}`
    return next()
  }
}/*, {prefix: '/foo'} works too, overrides the api prefix */)

let one = apiRouter.group(companies, profiles)
one.forEach((route) => console.log(route.route))

let two = apiRouter.group(users, cats)
two.forEach((route) => console.log(route.route))

let three = apiRouter.group(one, two)
three.forEach((route) => console.log(route.route))

console.log(apiRouter.routes.length) // 0

apiRouter.addRoutes(three)
console.log(apiRouter.routes.length) // 7

apiRouter.addRoutes(docs, bars)
console.log(apiRouter.routes.length) // 21

let megalong = apiRouter.group(docs, two, bars, three)
console.log(megalong.length) // 7
megalong.forEach((route) => console.log(route.route))

apiRouter.addRoutes(megalong)

console.log(apiRouter.getResource('cats'))

// listen for these routes
app.use(apiRouter.middleware())
app.listen(4321, () => {
  let localhost = 'http://localhost:4321'
  console.log(`Open ${localhost} and try:`)
  apiRouter.routes.forEach((route) => {
    console.log(`${route.method} ${localhost + route.path}`)
  })
})
