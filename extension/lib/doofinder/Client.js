'use strict'
const { promisify } = require('util')

class Client {
  /**
   * @param {Object} config
   * @param {string} authHeader
   */
  constructor (config, tracedRequest) {
    this._baseUri = `https://${config.zone}-search.doofinder.com/5/`
    this._hashId = config.hashId
    this._authKey = config.authKey
    this._tracedRequest = tracedRequest
  }

  /**
   * @param {Object} params
   * @param {string} endpoint
   */
  async request (params, endpoint = 'search') {
    const response = await promisify(this._tracedRequest('Doofinder'))({
      uri: this._baseUri + endpoint,
      qs: {...{hashid: this._hashId}, ...params},
      headers: {
        'Authorization': this._authKey
      },
      json: true
    })

    if (response.statusCode >= 500) {
      console.log(response.statusCode)
    }
    if (response.statusCode >= 400) {
      console.log(response.statusCode)
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
