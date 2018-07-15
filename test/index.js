'use strict'

const { test } = require('ava')
const validator = require('validator')

const SMSNumberVerifier = require('..')

test('basic', async (t) => {
  const smsVerifier = new SMSNumberVerifier('smsreceivefree')
  const number = await smsVerifier.getNumber()

  t.truthy(validator.isMobilePhone(number, 'en-US'))
  t.is(typeof smsVerifier.getAuthCodes, 'function')
})
