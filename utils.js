'use strict'

var utils = require('lazy-cache')(require)
var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend')
require('inflection')
require('koa-better-router', 'Router')
require('methods')
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign

utils.r = function r (name, id, edit) {
  name = name !== '' ? `/${name}` : ''
  let url = name + (id ? `/${id}` : '') + (edit ? `/${edit}` : '')
  return url
}

utils.updateRoute = function updateRoute (ctx, destRoute) {
  let route = destRoute.route.slice(1)
  /* istanbul ignore next */
  if (!route.length) return '/:id'
  route = route.replace(ctx.options.prefix, '')

  let res = []
  let singular = null
  let parts = route.split('/')

  var len = parts.length
  var i = -1

  while (i++ < len) {
    if (!(i % 2) && parts[i] && parts[i] !== 'edit') {
      let plur = parts[i]
      singular = utils.inflection.singularize(plur)
      res.push(plur)
      res.push(`:${singular}`)
    }
  }

  destRoute.route = `/${res.join('/')}`
  return destRoute
}

utils.notImplemented = function notImplemented () {
  return function notImplemented_ (ctx, next) {
    ctx.status = 501
    ctx.body = 'Not Implemented'
    return next()
  }
}

utils.defaultController = {
  new: utils.notImplemented(),
  show: utils.notImplemented(),
  edit: utils.notImplemented(),
  index: utils.notImplemented(),
  create: utils.notImplemented(),
  update: utils.notImplemented(),
  remove: utils.notImplemented()
}

utils.defaultControllerMap = {
  new: 'new',
  show: 'show',
  edit: 'edit',
  index: 'index',
  create: 'create',
  update: 'update',
  remove: 'remove'
}

utils.defaultRequestMethods = {}
utils.methods.forEach((method) => {
  utils.defaultRequestMethods[method] = method
})

utils.mergeOptions = function merge (opts, options) {
  options = utils.extend({}, options)
  let map = utils.extend(opts.map, options.map)
  let methods = utils.extend(opts.methods, options.methods)
  opts = utils.extend(opts, options)
  opts.map = map
  opts.methods = methods
  return opts
}

utils.createResourceRoutes = function createResourceRoutes (route, param, ctrl) {
  return function (self, opts) {
    self.options = utils.mergeOptions(self.options, opts)
    ctrl = utils.extend({}, utils.defaultController, ctrl)

    // map controller methods to be called
    let map = self.options.map

    // map request methods to be used
    let m = self.options.methods
    m.del = m.del || m.delete

    let src = []

    /* eslint-disable no-multi-spaces */
    let routes = [
      [ m.get,  utils.r(route),                 ctrl[map.index] ],
      [ m.get,  utils.r(route, 'new'),          ctrl[map.new] ],
      [ m.post, utils.r(route),                 ctrl[map.create] ],
      [ m.get,  utils.r(route, param),          ctrl[map.show] ],
      [ m.get,  utils.r(route, param, 'edit'),  ctrl[map.edit] ],
      [ m.put,  utils.r(route, param),          ctrl[map.update] ],
      [ m.del,  utils.r(route, param),          ctrl[map.remove] ]
    ]
    /* eslint-enable no-multi-spaces */

    // create RESTful routes
    routes.forEach((args) => {
      src.push(self.createRoute(args[0], args[1], args[2]))
    })

    /**
     * I'm tired of that fucking non-stop tricking
     * this fucking service - CodeClimate!
     * Below is more human-readable and human-understandable
     * variant of above shit. Thanks to god that there always
     * have more ways to write one thing.
     *
     * The whole thing is that you just use `koa-better-router`'s
     * `.createRoute` method which accepts METHOD, ROUTE and MIDDLEWARES.
     * In addition we allow re-mapping of request and controller methods.
     */
    // src.push(self.createRoute(m.get, utils.r(route), ctrl[map.index]))
    // src.push(self.createRoute(m.get, utils.r(route, 'new'), ctrl[map.new]))
    // src.push(self.createRoute(m.post, utils.r(route), ctrl[map.create]))
    // src.push(self.createRoute(m.get, utils.r(route, param), ctrl[map.show]))
    // src.push(self.createRoute(m.get, utils.r(route, param, 'edit'), ctrl[map.edit]))
    // src.push(self.createRoute(m.put, utils.r(route, param), ctrl[map.update]))
    // src.push(self.createRoute(m.del, utils.r(route, param), ctrl[map.remove]))

    return src
  }
}

/**
 * Expose `utils` modules
 */

module.exports = utils
