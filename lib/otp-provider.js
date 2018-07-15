'use strict'

/**
 * Abstract base class for SMS OTP providers.
 */
class OTPProvider {
  /**
   * Provider name.
   *
   * @member {string}
   */
  get name () {
    throw new Error('provider must override "name"')
  }

  /**
   */
  async getNumbers (opts) {
    throw new Error('provider must override "getNumbers"')
  }

  /**
   */
  async getMessages (opts) {
    throw new Error('provider must override "getMessages"')
  }
}

module.exports = OTPProvider
