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

utils.createPath = function createPath (ctx, destRoute) {
  let route = destRoute.route.slice(1)
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
  return `/${res.join('/')}`
}

utils.createRouteObject = function createRouteObject (ctx, dest, src, idx) {
  let pathname = utils.createPath(ctx, dest) + src[idx].route
  return ctx.createRoute(dest.method, pathname, src[idx].middlewares)
}

utils.notImplemented = function notImplemented () {
  return function (ctx, next) {
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

/**
 * Expose `utils` modules
 */

module.exports = utils
