/*!
 * koa-rest-router <https://github.com/tunnckoCore/koa-rest-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

// let inflect = require('inflection')
// let extend = require('extend-shallow')
// let Router = require('koa-router')
// // let util = require('util')

// let defaultController = {
//   index: notImplemented(),
//   new: notImplemented(),
//   create: notImplemented(),
//   edit: notImplemented(),
//   update: notImplemented(),
//   destroy: notImplemented(),
//   remove: notImplemented(),
//   delete: notImplemented(),
//   del: notImplemented()
// }

// function RestRouter (name, controller, options) {
//   if (!(this instanceof RestRouter)) {
//     return new RestRouter(name, controller, options)
//   }
//   if (typeof name === 'object') {
//     controller = name
//     name = '/'
//   }
//   if (typeof name !== 'string') {
//     name = '/'
//   }
//   this._name = name !== '/'
//     ? inflect.pluralize(name)
//     : ''
//   this._param = name !== '/'
//     ? ':' + inflect.singularize(name)
//     : ':id'
//   this._ctrl = extend(defaultController, controller)
//   this._options = extend({}, options)
//   this.router = new Router()
// }

// // util.inherits(RestRouter, Router)

// RestRouter.prototype.rest = function rest () {
//   let self = this
//   this.router
//     .get(r(this._name), this._ctrl.index)
//     .get(r(this._name, 'new'), this._ctrl.new)
//     .post(r(this._name), this._ctrl.create)
//     // Fix `/users/new` to call `controller.new` method
//     // it conflicts because `/users/:user` handles it
//     .get(r(this._name, this._param), function (ctx, next) {
//       if (ctx.params[self._param.slice(1)] === 'new') {
//         self._ctrl.new.apply(self._ctrl, arguments)
//         return
//       }
//       self._ctrl.show.apply(self._ctrl, arguments)
//     })
//     .get(r(this._name, this._param, 'edit'), this._ctrl.edit)

//     // autohandle updates
//     // PUT     /users/:user       ->  update
//     // POST    /users/:user       ->  update
//     // PATCH   /users/:user       ->  update
//     .put(r(this._name, this._param), this._ctrl.update)
//     .post(r(this._name, this._param), this._ctrl.update)
//     .patch(r(this._name, this._param), this._ctrl.update)

//     // autohandle deletes
//     // DELETE   /users/:user       ->  destroy
//     // DELETE   /users/:user       ->  remove
//     // DELETE   /users/:user       ->  delete
//     // DELETE   /users/:user       ->  del
//     .del(r(this._name, this._param), this._ctrl.destroy)
//     .del(r(this._name, this._param), this._ctrl.remove)
//     .del(r(this._name, this._param), this._ctrl.delete)
//     .del(r(this._name, this._param), this._ctrl.del)
//   return this.router.routes()
// }

// function notImplemented () {
//   return function (ctx, next) {
//     // ctx.throw(501)
//     ctx.status = 501
//     ctx.body = 'Not Implemented'
//     return next()
//   }
// }

// function r (name, id, edit) {
//   name = name !== '' ? `/${name}` : ''
//   let url = name + (id ? `/${id}` : '') + (edit ? `/${edit}` : '')
//   console.log(url)
//   return url
// }

// module.exports.RestRouter = RestRouter
// module.exports.Router = Router
