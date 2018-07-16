'use strict'

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

  async getNumbers (opts) {
    const result = await this._client.getNumber(opts)

    return [ result ]
  }

  async getMessages (opts) {
    const text = await this._client.getSMS(opts)

    if (text) {
      const result = parseMessage(text)

      if (result && result.code && result.service) {
        return {
          ...result,
          to: opts.number,
          text,
          timestamp: new Date()
        }
      }
    }
  }
}

module.exports = GetSMSCodeOTPProvider