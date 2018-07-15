'use strict'

const { test } = require('ava')
const validator = require('validator')

const SMSReceiveFreeOTPProvider = require('../lib/provider-smsreceivefree')
const provider = new SMSReceiveFreeOTPProvider()

test('getNumbers', async (t) => {
  const numbers = await provider.getNumbers()
  t.truthy(numbers.length > 0)

  numbers.forEach((number) => {
    t.truthy(validator.isMobilePhone(number, 'en-US'))
  })

  const numbers2 = await provider.getNumbers()
  t.deepEqual(numbers, numbers2)
})

test('getMessages', async (t) => {
  const numbers = await provider.getNumbers()
  const number = numbers[Math.random() * numbers.length | 0]
  t.truthy(number)

  const messages = await provider.getMessages({ number })
  t.truthy(messages.length >= 0)

  messages.forEach((m) => {
    t.is(typeof m.from, 'string')
    t.is(typeof m.timestamp, 'object')
    t.is(typeof m.text, 'string')
  })
})
