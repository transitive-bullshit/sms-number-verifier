'use strict'

const { test } = require('ava')
const validator = require('validator')

const provider = require('./provider-smsreceivefree')

test('getNumbers', async (t) => {
  const numbers = await provider._getNumbers()
  t.truthy(numbers.length > 0)

  numbers.forEach((number) => {
    t.truthy(validator.isMobilePhone(number, 'en-US'))
  })

  const numbers2 = await provider._getNumbers()
  t.deepEqual(numbers, numbers2)
})

test('getMessagesForNumber', async (t) => {
  const messages = await provider._getMessagesForNumber('18383000677')
  t.truthy(messages.length > 0)

  messages.forEach((m) => {
    t.is(typeof m.from, 'string')
    t.is(typeof m.timestamp, 'object')
    t.is(typeof m.message, 'string')
    t.is(typeof m.code, 'string')
    t.is(typeof m.service, 'string')
  })
})
