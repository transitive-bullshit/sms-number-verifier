'use strict'

const ow = require('ow')

exports.providers = {
  'smsreceivefree': require('./provider-smsreceivefree')
}

exports.getProviderByName = (provider, opts) => {
  ow(provider, ow.string.nonEmpty.label('provider'))
  const Provider = exports.providers[provider.toLowerCase()]

  if (!Provider) throw new Error(`unrecognized provider "${provider}"`)
  return new Provider(opts)
}
