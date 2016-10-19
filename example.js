'use strict'

let Koa = require('koa')
let Router = require('./index')
let app = new Koa()

let apiRouter = new Router({
  prefix: '/api/v1'
})

let ctrl = {
  show: function * (next) {
    console.log('=')
    console.log(this.originUrl)
    console.log(this.origin)
    console.log(this.hostname)
    console.log(this.host)
    this.body = `path is ${this.route.path}, haha`
    this.body = `${this.body}!! :company is ${this.params.company}, yea`
    yield next
  }
}

let companies = apiRouter.createResource('companies', ctrl)
let profiles = apiRouter.createResource('profiles', ctrl)
let users = apiRouter.createResource('users', ctrl)
let docs = apiRouter.createResource('docs', ctrl)
let bars = apiRouter.createResource('bars', ctrl)
let cats = apiRouter.createResource('cats', ctrl)

let one = apiRouter.groupResources(companies, profiles)
one.forEach((route) => console.log(route.route))

let two = apiRouter.groupResources(users, cats)
two.forEach((route) => console.log(route.route))

let three = apiRouter.groupResources(one, two)
three.forEach((route) => console.log(route.route))

console.log(apiRouter.routes.length) // 0

apiRouter.addRoutes(three)
console.log(apiRouter.routes.length) // 7

apiRouter.addRoutes(docs, bars)
console.log(apiRouter.routes.length) // 21

let megalong = apiRouter.groupResources(docs, two, bars, three)
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
