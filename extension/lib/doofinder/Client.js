'use strict'
const { promisify } = require('util')

class Client {
  /**
   * @param {Object} config
   * @param {string} authHeader
   */
  constructor ({config, tracedRequest, log}) {
    this.baseUri = `https://${config.zone}-search.doofinder.com/5/`
    this.hashId = config.hashId
    this.authKey = config.authKey
    this.tracedRequest = tracedRequest
    this.log = log
  }

  /**
   * @param {Object} params
   * @param {string} endpoint
   */
  async request (params, endpoint = 'search') {
    const response = await promisify(this.tracedRequest('Doofinder'))({
      uri: this.baseUri + endpoint,
      qs: {...{hashid: this.hashId}, ...params},
      headers: {
        'Authorization': this.authKey
      },
      json: true
    })
    if (response.statusCode >= 400) {
      this.log.error(`Doofinder error code ${response.statusCode} in response`, response.body)
    }

    return response
  }

  /**
   * @param {SearchRequest} searchPhrase
   * @returns {Array}
   */
  async searchSuggestions (searchPhrase) {
    const titles = []
    const response = await this.request({query: searchPhrase.query}, 'suggest')
    for (const result of response.body.results) {
      titles.push(result.term.charAt(0).toUpperCase() + result.term.slice(1))
    }

    return titles
  }
}

module.exports = Client
