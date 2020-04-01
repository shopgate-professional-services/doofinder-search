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
    const titles = []
    const response = await this.request({query: searchPhrase.query})
    for (const result of response.body.results) {
      titles.push(result.title)
    }

    return titles
  }

  async request (params) {
    const response = await promisify(this._tracedRequest('Doofinder'))({
      uri: this._baseUri,
      qs: {...{hashid: this._hashId}, ...params},
      headers: {
        'Authorization': this._authHeader
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
}

module.exports = Client
