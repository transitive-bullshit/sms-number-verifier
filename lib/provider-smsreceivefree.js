'use strict'

const cheerio = require('cheerio')
const parseMessage = require('parse-otp-message')
const parseTime = require('parsetime')
const request = require('./request')

const OTPProvider = require('./otp-provider')

const baseUrl = 'https://smsreceivefree.com'

class SMSReceiveFreeOTPProvider extends OTPProvider {
  get name () {
    return 'smsreceivefree'
  }

  async getNumbers (opts = { }) {
    const {
      country = 'usa'
    } = opts

    const html = await request(`${baseUrl}/country/${country}`)
    const $ = cheerio.load(html)

    return $('a.numbutton')
      .map((i, a) => $(a).text())
      .get()
      .map((n) => {
        const match = n.match(/^\+(\d+)/)
        if (match) return match[1]
      })
      .filter(Boolean)
  }

  async getMessages (opts) {
    const {
      number
    } = opts

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
            text: tds[2].trim()
          }
        }
      })
      .get()
      .filter(Boolean)
      .map((m) => {
        const result = parseMessage(m.text)

        if (result && result.code && result.service) {
          m.code = result.code
          m.service = result.service
          return m
        }
      })
      .filter(Boolean)
  }
}

module.exports = SMSReceiveFreeOTPProvider
