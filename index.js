'use strict'

const ow = require('ow')
const pRetry = require('p-retry')
const randomItem = require('random-item')
const PhoneNumber = require('awesome-phonenumber')

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
      minTimeout = 5000,
      maxTimeout = 20000,
      timestamp = this._timestamp,
      number,
      service,
      ...rest
    } = opts

    ow(number, ow.string.nonEmpty.label('number'))
    ow(service, ow.string.nonEmpty.label('service'))
    ow(opts, ow.object.plain.nonEmpty.label('opts'))

    let attempt = 0
    return pRetry(async () => {
      const messages = await this._provider.getMessages({ number, service, ...rest, attempt })

      const results = (messages || [])
        .filter((m) => m.service === service)
        .filter((m) => !timestamp || m.timestamp >= timestamp)
        .map((m) => m.code)

      if (!results.length) {
        ++attempt
        throw new Error(`waiting for SMS message for service \`${service}\` at number \`${number}\``)
      }

      return results
    }, {
      retries,
      minTimeout,
      maxTimeout
    })
  }

  /**
   * Parses the given number using google's libphonenumber.
   *
   * @param {string} number - Phone number to parse
   * @return {object}
   */
  getNumberInfo (number) {
    number = number.trim()

    if (!number.startsWith('+')) {
      number = `+${number}`
    }

    return new PhoneNumber(number)
  }
}

module.exports = SMSNumberVerifier
