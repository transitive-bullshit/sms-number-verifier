'use strict'

const ow = require('ow')
const parseMessage = require('parse-otp-message')
const plivo = require('plivo')
const pEvent = require('p-event')

const IncomingSMSServer = require('./incoming-sms-server')
const OTPProvider = require('./otp-provider')

class PlivoOTPProvider extends OTPProvider {
  constructor (opts = { }) {
    super()

    ow(opts, ow.object.plain.label('opts'))

    const authId = opts.authId || process.env.PLIVO_AUTH_ID
    const authToken = opts.authToken || process.env.PLIVO_AUTH_TOKEN

    ow(authId, ow.string.nonEmpty.label('plivo authId'))
    ow(authToken, ow.string.nonEmpty.label('plivo authToken'))

    this._messages = { }

    this._client = new plivo.Client(authId, authToken)

    this._server = new IncomingSMSServer({
      transform: (body) => {
        const message = {
          from: body.From,
          to: body.To,
          text: body.Text,
          id: body.MessageUUID,
          timestamp: new Date()
        }

        const result = parseMessage(message.text)
        if (result && result.code && result.service) {
          message.code = result.code
          message.service = result.service
          return message
        }
      }
    })

    this._server.on('message', (message) => {
      if (!this._messages[message.to]) {
        this._messages[message.to] = []
      }

      // TODO: limit max number of messages stored in memory
      this._messages[message.to].push(message)
    })
  }

  get name () {
    return 'plivo'
  }

  async getNumbers (opts = { }) {
    const {
      limit = 20,
      offset = 0
    } = opts

    await this._ensureInitialized()

    const results = await this._client.numbers.list({
      limit: Math.max(1, Math.min(20, limit)),
      offset: Math.max(0, offset),
      services: 'sms'
    })

    return results
      .map((o) => o.number)
  }

  async getMessages (opts) {
    const {
      timeout = 60000,
      number,
      service
    } = opts

    ow(number, ow.string.nonEmpty.label('number'))
    ow(service, ow.string.nonEmpty.label('service'))

    await this._ensureInitialized()

    if (this._messages[number]) {
      return this._messages[number].reverse().slice(0, 3)
    }

    await pEvent(this._server, 'message', {
      timeout,
      filter: (message) => {
        return (message.to === number && message.service === service)
      }
    })

    return this._messages[number].reverse().slice(0, 3)
  }

  async _ensureInitialized () {
    if (this._initialized) return

    const apps = await this._client.applications.list()
    const app = apps.filter((app) => app.defaultApp)[0]

    if (!app) {
      throw new Error('unable to find default plivo app')
    }

    await this._server.listen()

    await this._client.applications.update(app.id, {
      message_url: this._server.url,
      message_method: this._server.method
    })

    this._initialized = true
  }

  async close () {
    if (!this._initialized) return

    await this._server.close()
    this._initialized = false
  }
}

module.exports = PlivoOTPProvider
