# sms-number-verifier

> Allows you to spoof SMS number verification.

[![NPM](https://img.shields.io/npm/v/sms-number-verifier.svg)](https://www.npmjs.com/package/sms-number-verifier) [![Build Status](https://travis-ci.org/transitive-bullshit/sms-number-verifier.svg?branch=master)](https://travis-ci.org/transitive-bullshit/sms-number-verifier) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

- meant for automated systems that need to bypass SMS number verification
- handles hundreds of known services (wechat, google, facebook, whatsapp, uber, twitter, etc...)
- thorough test suite
- great for bots...


## Install

This module requires `node >= 8`.

```bash
npm install --save sms-number-verifier
```


## Usage

```js
const smsNumberVerifier = require('sms-number-verifier')

// create a new verification request
const request = await smsNumberVerifier()
// request.number = '18383000677'

// give request.number to third-party service such as google...
// third-party service sends SMS code to the given number

// check for valid codes received via SMS from the google service
const codes = await request.getAuthCodes('google')
// codes = [ '584125' ]
```

Note: there may be multiple auth codes returned since the SMS numbers being used are publicly shared. We filter the results down to only those codes that could possibly be associated with your request, and most of the time you will only receive one code back. In the case of multiple codes, we recommend you try the codes in-order (the most recently received code will be first).


## API

### smsNumberVerifier(opts)

Returns: `Promise<VerificationRequest>`

Starts a new verification request, returning a phone number to use and metadata for the request.

#### opts

Type: `Object`

#### opts.provider

Type: `String`

Optionally specify a preferred provider.

#### opts.blacklist

Type: `Set<String>`

Optional number blacklist.

#### opts.whitelist

Type: `Set<String>`

Optional number whitelist.

### VerificationRequest

Type: `Object`

Represents a single SMS verification request.

#### VerificationRequest.number

Type: `String`

Phone Number to use for this request.

#### VerificationRequest.timestamp

Type: `Date`

Time at which this verification request was initialized. This is used to filter the list of potential auth codes to only those received after the verification request started.

#### VerificationRequest.getAuthCodes

Type: `function(service: String)`
Returns: `Promise<Array<String>>`

Function to get possible auth codes associated with the number in this request and a specified `service`.

Service examples: `'google'`, `'microsoft'`, `'wechat'`, etc.


## Todo

- [ ] support country selection
- [ ] support more providers
  - [ ] [trash mobile](https://www.spoofbox.com/en/tool/trash-mobile)
  - [ ] [misc](https://drfone.wondershare.com/message/receive-message-online.html)
- [ ] support twilio provider


## Related

- [parse-otp-message](https://github.com/transitive-bullshit/parse-otp-message) - Parses OTP messages for a verification code and service provider.


## Disclaimer

Using this softare to violate the terms and conditions of any third-party service is strictly against the intent of this software. By using this software, you are acknowledging this fact and absolving the author or any potential liability or wrongdoing it may cause. This software is meant for experimental purposes only, so please act responsibly.


## License

MIT © [Travis Fischer](https://github.com/transitive-bullshit)
