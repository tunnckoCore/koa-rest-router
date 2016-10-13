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
  utils.Router.call(this, options)
}

util.inherits(KoaRestRouter, utils.Router)

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
    this._routes.push(route)
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

  let oldRoutes = utils.cloneArray(this._routes)
  this._routes = []
  this.options = utils.extend({}, this.options, opts)

  ctrl = utils.extend({}, utils.defaultController, ctrl)

  // @todo use `.addRoute`
  this
    .get(utils.r(pathname), ctrl.index)
    .get(utils.r(pathname, 'new'), ctrl.new)
    .post(utils.r(pathname), ctrl.create)
    .get(utils.r(pathname, param), ctrl.show)
    .get(utils.r(pathname, param, 'edit'), ctrl.edit)

    // auto-handle updates
    // PUT     /users/:user       ->  update
    // POST    /users/:user       ->  update
    // PATCH   /users/:user       ->  update
    .put(utils.r(pathname, param), ctrl.update)
    .post(utils.r(pathname, param), ctrl.update)
    .patch(utils.r(pathname, param), ctrl.update)

    // auto-handle deletes
    // DELETE   /users/:user       ->  destroy
    // DELETE   /users/:user       ->  remove
    // DELETE   /users/:user       ->  delete
    // DELETE   /users/:user       ->  del
    .del(utils.r(pathname, param), ctrl.destroy)
    .del(utils.r(pathname, param), ctrl.remove)
    .del(utils.r(pathname, param), ctrl.delete)
    .del(utils.r(pathname, param), ctrl.del)

  let srcRoutes = utils.cloneArray(this._routes)
  this._routes = oldRoutes.concat(srcRoutes)
  return srcRoutes
}
