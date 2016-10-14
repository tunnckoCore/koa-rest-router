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
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign

utils.r = function r (name, id, edit) {
  name = name !== '' ? `/${name}` : ''
  let url = name + (id ? `/${id}` : '') + (edit ? `/${edit}` : '')
  return url
}

utils.cloneArray = function cloneArray (arr) {
  let res = []
  for (const item of arr) {
    res.push(item)
  }
  return res
}

utils.createPath = function createPath (destRoute, srcRoute, third) {
  let destParts = destRoute.path.split('/')
  let srcParts = srcRoute.path.split('/')
  let singular = third
    ? utils.inflection.singularize(destParts[3])
    : utils.inflection.singularize(destParts[1])
  let len = third ? 4 : 2
  let part3 = third ? destParts[5] : destParts[3]

  if (destParts.length === len) {
    destParts.push(`:${singular}`)
  }
  if (destParts[2] === 'new') {
    destParts[2] = `:${singular}`
  }
  if (third && destParts[4] === 'new') {
    destParts[4] = `:${singular}`
  }
  if (part3 === 'edit') {
    destParts = destParts.slice(0, -1)
  }

  let path = destParts.concat(srcParts).filter(Boolean)
  return '/' + path.join('/')
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

utils.defaultRequestMethods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE'
}

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
