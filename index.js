'use strict'

const providers = require('./lib/providers')
const randomItem = require('random-item')

module.exports = async (opts = { }) => {
  const provider = opts.provider
    ? providers.find((provider) => provider.name === opts.provider)
    : randomItem(providers)

  if (!provider) {
    throw new Error('invalid argument "opts.provider" not found')
  }

  const number = await provider.module.getNumber(opts)
  if (!number) {
    throw new Error(`failed to get number from provider "${provider.name}"`)
  }

  // record the time we started this verification request so we only consider
  // auth codes that are received later.
  const timestamp = new Date()

  return {
    number,
    timestamp,
    getAuthCodes: (service) => provider.module.getAuthCodes(number, service, {
      timestamp
    })
  }
}
