'use strict'
const { promisify } = require('util')

class Client {
  /**
   * @param {Object} config
   * @param {string} authHeader
   */
  constructor (config, tracedRequest) {
    this._baseUri = `https://${config.zone}-search.doofinder.com/5/search/`
    this._hashId = config.hashId
    this._authKey = config.authKey
    this._tracedRequest = tracedRequest
  }

  /**
   * @param {Object} params
   */
  async request (params) {
    const response = await promisify(this._tracedRequest('Doofinder'))({
      uri: this._baseUri,
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
    const response = await this.request({query: searchPhrase.query})
    for (const result of response.body.results) {
      titles.push(result.title) // todo maybe better collect keywords instead response.body.g:keywords
    }

    return titles
  }
}

module.exports = Client
