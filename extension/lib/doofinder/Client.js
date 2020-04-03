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

    return response.body
  }

  /**
   * @param {String} query
   * @param {Number} offset
   * @param {Number} limit
   */
  async paginatedRequest (query, offset, limit) {
    const firstPage = Math.floor(offset / 10) + 1
    const lastPage = Math.ceil((offset + limit) / 10)
    let skipCount = offset % 10
    let results = []
    let totalProductCount = 0

    for (let currentPage = firstPage; currentPage <= lastPage; currentPage++) {
      const response = await this.request({query, page: currentPage})
      totalProductCount = response.total
      results = results.concat(response.results)
    }

    return {
      results: results.slice(skipCount, limit + skipCount),
      totalProductCount
    }
  }

  /**
   * @param {String} query
   * @returns {Array}
   */
  async searchSuggestions (query) {
    const suggestions = []
    const response = await this.request({query}, 'suggest')
    for (const result of response.results) {
      suggestions.push(result.term.charAt(0).toUpperCase() + result.term.slice(1))
    }

    return { suggestions }
  }

  /**
   * @param {PipelineInput} param0
   */
  async searchProducts ({searchPhrase, offset, limit, sort}) {
    let productIds = []
    const response = await this.paginatedRequest(searchPhrase, offset, limit)
    for (const result of response.results) {
      productIds.push(result.fallback_reference_id)
    }

    return {
      productIds,
      totalProductCount: response.totalProductCount
    }
  }
}

module.exports = Client
