'use strict'

const cheerio = require('cheerio')
const parseMessage = require('parse-otp-message')
const parseTime = require('parsetime')
const pMemoize = require('p-memoize')
const randomItem = require('random-item')
const request = require('request-promise-native')

const baseUrl = 'https://smsreceivefree.com'

exports.getNumber = async (opts) => {
  let numbers = await exports._getNumbers()

  if (opts.blacklist) {
    numbers = numbers.filter((number) => !opts.blacklist.has(number))
  }

  if (opts.whitelist) {
    numbers = numbers.filter((number) => opts.whitelist.has(number))
  }

  return randomItem(numbers)
}

exports.getAuthCodes = async (number, service, opts) => {
  const messages = await exports._getMessagesForNumber(number)
  const filtered = messages
    .filter((m) => m.service === service)
    .filter((m) => !opts.timestamp || m.timestamp > opts.timestamp)

  if (filtered.length) {
    return filtered.map((m) => m.code)
  }
}

exports._getNumbers = pMemoize(async () => {
  const html = await request(`${baseUrl}/country/usa`)
  const $ = cheerio.load(html)

  return $('a.numbutton')
    .map((i, a) => $(a).text())
    .get()
    .map((n) => {
      const match = n.match(/^\+(\d+)/)
      if (match) return match[1]
    })
    .filter(Boolean)
})

exports._getMessagesForNumber = async (number) => {
  const html = await request(`${baseUrl}/info/${number}/`)
  const $ = cheerio.load(html)

  return $('.msgTable tr')
    .map((i, el) => {
      const tds = $('td', $(el))
        .map((i, e) => $(e).text())
        .get()

      if (tds.length === 3) {
        const timeago = parseTime(tds[1].trim())
        return {
          from: tds[0].trim(),
          timestamp: new Date(timeago.absolute),
          message: tds[2].trim()
        }
      }
    })
    .get()
    .filter(Boolean)
    .map((m) => {
      const result = parseMessage(m.message)

      if (result && result.code && result.service) {
        m.code = result.code
        m.service = result.service
        return m
      }
    })
    .filter(Boolean)
}
