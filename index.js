'use strict'

const ow = require('ow')
const pRetry = require('p-retry')
const pTimeout = require('p-timeout')
const randomItem = require('random-item')

const OTPProvider = require('./lib/otp-provider')
const providers = require('./lib/providers')

/**
 * Main entrypoint for verifying numbers via SMS OTP.
 *
 * @param {string|OTPProvider} provider - Name of built-in provider or an instance
 * of a custom provider.
 * @param {object} [opts={}] - Config options for provider
 */
class SMSNumberVerifier {
  constructor (provider, opts = { }) {
    this._provider = typeof provider === 'object'
      ? provider
      : providers.getProviderByName(provider, opts)
    ow(this._provider, ow.object.instanceOf(OTPProvider).label('provider'))
    ow(opts, ow.object.plain)

    this._timestamp = new Date()
  }

  /**
   * Underlying OTP provider.
   *
   * @member {OTPProvider}
   */
  get provider () { return this._provider }

  /**
   * @return {Promise<string>}
   */
  async getNumber (opts = { }) {
    ow(opts, ow.object.plain.label('opts'))

    const {
      blacklist,
      whitelist,
      ...rest
    } = opts

    let numbers = await this._provider.getNumbers(rest)

    if (blacklist) {
      numbers = numbers.filter((number) => !blacklist.has(number))
    }

    if (whitelist) {
      numbers = numbers.filter((number) => whitelist.has(number))
    }

    return randomItem(numbers)
  }

  /**
   * @return {Promise<Array<string>>}
   */
  async getAuthCodes (opts) {
    const {
      retries = 3,
      timeout = 30000,
      timestamp = this._timestamp,
      number,
      service,
      pid,
      ...rest
    } = opts

    ow(number, ow.string.nonEmpty.label('number'))
    ow(service, ow.string.nonEmpty.label('service'))
    ow(opts, ow.object.plain.nonEmpty.label('opts'))

    return pTimeout(pRetry(async () => {
      const messages = await this._provider.getMessages({ number, service, pid })

      const results = messages
        .filter((m) => m.service === service)
        .filter((m) => !timestamp || m.timestamp >= timestamp)
        .map((m) => m.code)

      if (!results.length) {
        throw new Error(`waiting for SMS message for service \`${service}\` at number \`${number}\`)`)
      }

      return results
    }, {
      retries,
      maxTimeout: timeout,
      ...rest
    }), timeout)
  }
}

module.exports = SMSNumberVerifier
