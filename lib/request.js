'use strict'

const request = require('request-promise-native')

const baseUrl = 'https://smsreceivefree.com'
const jar = request.jar()

// TODO: allow user to specify their own cookies for this provider...
jar.setCookie('SMSRF_SESSION=b46d07de818b6940f120505896a79fa7c3696238-___TS=2395527217090&id=bcb574364057020f26ab56642ce16506d7f317e0', baseUrl)
jar.setCookie('__cfduid=d73073a6149167b0bd9e705adc19c350a1531527131', baseUrl)
jar.setCookie('_ga=GA1.2.607869491.1531527132', baseUrl)
jar.setCookie('_gid=GA1.2.1379182782.1531527132', baseUrl)

module.exports = request.defaults({
  jar,
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
  }
})
