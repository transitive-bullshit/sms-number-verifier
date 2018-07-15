'use strict'

const Koa = require('koa')
const Router = require('koa-router')
const EventEmitter = require('events')

const ngrok = require('ngrok')
const parse = require('co-body')
const pify = require('pify')

const noop = (m) => m
const route = '/1/messages'

class IncomingSMSServer extends EventEmitter {
  constructor (opts) {
    super()

    const {
      port = process.env.PORT || 11849,
      transform = noop
    } = opts

    this._port = port
    this._app = new Koa()
    this._router = new Router()

    this._router.post(route, async (ctx) => {
      const body = await parse(ctx)
      const message = transform(body)

      ctx.status = 200
      ctx.body = ''

      if (message) {
        this.emit('message', message)
      }
    })

    this._app.use(this._router.routes())
  }

  async listen () {
    this._app.listen(this._port)

    this.uri = await ngrok.connect(this._port)
    this.url = `${this.uri}${route}`
    this.method = 'POST'
  }

  async close () {
    await ngrok.disconnect()
    await pify(this._app.close)()
  }
}

module.exports = IncomingSMSServer
