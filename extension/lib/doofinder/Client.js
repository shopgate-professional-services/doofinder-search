'use strict'
const { promisify } = require('util')

class Client {
  /**
   * @param {string} baseUri
   * @param {Object} hashId
   * @param {string} authHeader
   */
  constructor (baseUri, hashId, authHeader, tracedRequest) {
    this._baseUri = baseUri
    this._hashId = hashId
    this._authHeader = authHeader
    this._tracedRequest = tracedRequest
  }

  /**
   * add other options here, like page, filters
   *
   * @param {SearchRequest} searchPhrase
   * @returns {Array}
   */
  async searchSuggestions (searchPhrase) {
    var options = {
      uri: this._baseUri + 'search/',
      qs: {
        hashid: this._hashId,
        query: searchPhrase.query
      },
      headers: {
        'Authorization': this._authHeader
      },
      json: true
    }

    const title = []
    const response = await this.request(options)
    console.log(response)
    for (const result of response.body.results) {
      title.push(result.title)
    }

    return title
  }

  async request (options) {
    const response = await promisify(this._tracedRequest('Doofinder'))(options)

    if (response.statusCode >= 500) {
      console.log(response.statusCode)
    }
    if (response.statusCode >= 400) {
      console.log(response.statusCode)
    }

    return response
  }
}

module.exports = Client
