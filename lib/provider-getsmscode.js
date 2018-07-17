'use strict'

const delay = require('delay')
const ow = require('ow')
const parseMessage = require('parse-otp-message')

const GetSMSCodeClient = require('getsmscode')
const OTPProvider = require('./otp-provider')

class GetSMSCodeOTPProvider extends OTPProvider {
  constructor (opts = { }) {
    super()

    ow(opts, ow.object.plain.label('opts'))

    this._client = new GetSMSCodeClient(opts)
  }

  get name () {
    return 'getsmscode'
  }

  async addNumberToBlacklist (opts) {
    return this._client.addNumberToBlacklist(opts)
  }

  async getNumbers (opts) {
    const result = await this._client.getNumber(opts)

    return [ result ]
  }

  async getMessages (opts) {
    if (opts && opts.attempt === 0) {
      await delay(10000)
    }

    const text = (await this._client.getSMS(opts)).trim()
    console.log('provider-getsmscode.getMessages', text)

    if (text === 'Message|not receive' || text === 'Message|Please wait 10 seconds to request!') {
      return
    }

    if (text) {
      const result = parseMessage(text)
      console.log('provider-getsmscode.getMessages', result)

      if (result && result.code && result.service) {
        return [
          {
            ...result,
            to: opts.number,
            text,
            timestamp: new Date()
          }
        ]
      }
    }
  }
}

module.exports = GetSMSCodeOTPProvider
