'use strict'

const { test } = require('ava')
const validator = require('validator')

const smsNumberVerifier = require('.')

test('basic', async (t) => {
  const request = await smsNumberVerifier()
  console.log(request.number)

  t.truthy(validator.isMobilePhone(request.number, 'en-US'))
  t.is(typeof request.getAuthCodes, 'function')
})
