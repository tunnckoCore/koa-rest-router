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
  this.resources = []
}

util.inherits(KoaRestRouter, utils.Router)

KoaRestRouter.prototype.addRoutes = function addRoutes () {
  this.routes = this.routes.concat.apply(this.routes, arguments)
  return this
}

KoaRestRouter.prototype.getRoutes = function getRoutes () {
  return this.routes
}

KoaRestRouter.prototype.addResources = function addResources () {
  return this.addRoutes.apply(this, arguments)
}

KoaRestRouter.prototype.getResources = function getResources () {
  return this.resources
}

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

KoaRestRouter.prototype.addResource = function addResource (resource) {
  this.routes = this.routes.concat(resource)
  return this
}

KoaRestRouter.prototype.resource = function resource_ () {
  let resource = this.createResource.apply(this, arguments)
  return this.addResource(resource)
}

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
  let route = name !== '/'
    ? utils.inflection.pluralize(_name)
    : ''
  let param = name !== '/'
    ? ':' + utils.inflection.singularize(_name)
    : ':id'

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

  // create RESTful routes
  let src = []
  src.push(this.createRoute(_get, utils.r(route), ctrl[_index]))
  src.push(this.createRoute(_get, utils.r(route, 'new'), ctrl[_new]))
  src.push(this.createRoute(_post, utils.r(route), ctrl[_create]))
  src.push(this.createRoute(_get, utils.r(route, param), ctrl[_show]))
  src.push(this.createRoute(_get, utils.r(route, param, 'edit'), ctrl[_edit]))
  src.push(this.createRoute(_put, utils.r(route, param), ctrl[_update]))
  src.push(this.createRoute(_del, utils.r(route, param), ctrl[_remove]))

  // add them to cache
  src.name = route === '' ? '/' : route
  this.resources.push(src)

  // just return them without
  // adding them to `this.routes`
  return src
}

KoaRestRouter.prototype.group = function group (dest, src1, src2, src3, src4) {
  return dest.map((destRoute, index) => {
    let route = utils.createRouteObject(this, destRoute, src1, index)
    if (src2) route = utils.createRouteObject(this, route, src2, index)
    if (src3) route = utils.createRouteObject(this, route, src3, index)
    if (src4) route = utils.createRouteObject(this, route, src4, index)
    return route
  })
}

module.exports = KoaRestRouter
