/*!
 * koa-rest-router <https://github.com/tunnckoCore/koa-rest-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

let util = require('util')
let utils = require('./utils')

function KoaRestRouter (options) {
  if (!(this instanceof KoaRestRouter)) {
    return new KoaRestRouter(options)
  }
  utils.Router.call(this, utils.mergeOptions({
    methods: utils.defaultRequestMethods,
    map: utils.defaultControllerMap
  }, options))
}

util.inherits(KoaRestRouter, utils.Router)

// searching for better name... Which should not be too long
// and be meaningful and user-fiendly, easy to guest what it does
KoaRestRouter.prototype.extend = function extend (dest, src1, src2) {
  let res = []
  let len = dest.length
  let i = 0

  while (i < len) {
    let idx = i++
    let destRoute = dest[idx]
    let srcRoute = src1[idx]
    let pathname = utils.createPath(destRoute, srcRoute)
    let route = {
      path: pathname,
      match: this.route(pathname),
      middlewares: srcRoute.middlewares,
      method: srcRoute.method
    }

    if (src2) {
      let extraRoute = src2[idx]
      pathname = utils.createPath(route, extraRoute, true)
      route = {
        path: pathname,
        match: this.route(pathname),
        middlewares: extraRoute.middlewares,
        method: extraRoute.method
      }
    }

    res.push(route)
    this.routes.push(route)
  }
  return res
}

KoaRestRouter.prototype.resource = function resource (name, ctrl, opts) {
  if (typeof name === 'object') {
    opts = ctrl
    ctrl = name
    name = '/'
  }
  if (typeof name !== 'string') {
    name = '/'
  }
  let pathname = name !== '/'
    ? utils.inflection.pluralize(name)
    : ''
  let param = name !== '/'
    ? ':' + utils.inflection.singularize(name)
    : ':id'

  let oldRoutes = utils.cloneArray(this.routes)
  this.options = utils.mergeOptions(this.options, opts)

  ctrl = utils.extend({}, utils.defaultController, ctrl)

  // map request methods to be used
  let _get = this.options.methods.get
  let _put = this.options.methods.put
  let _del = this.options.methods.del || this.options.methods.delete
  let _post = this.options.methods.post

  // map controller methods to be called
  let _index = this.options.map.index
  let _new = this.options.map.new
  let _create = this.options.map.create
  let _show = this.options.map.show
  let _edit = this.options.map.edit
  let _update = this.options.map.update
  let _remove = this.options.map.remove

  // add RESTful routes
  this
    .addRoute(_get, utils.r(pathname), ctrl[_index])
    .addRoute(_get, utils.r(pathname, 'new'), ctrl[_new])
    .addRoute(_post, utils.r(pathname), ctrl[_create])
    .addRoute(_get, utils.r(pathname, param), ctrl[_show])
    .addRoute(_get, utils.r(pathname, param, 'edit'), ctrl[_edit])
    .addRoute(_put, utils.r(pathname, param), ctrl[_update])
    .addRoute(_del, utils.r(pathname, param), ctrl[_remove])

  let srcRoutes = utils.cloneArray(this.routes)

  // restore routes
  this.routes = oldRoutes.concat(srcRoutes)

  // return only routes that are just created
  // for this resource
  return srcRoutes
}

module.exports = KoaRestRouter
