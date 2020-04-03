'use strict'
const { promisify } = require('util')

class Client {
  /**
   * @param {Object} config
   */
  constructor ({config, tracedRequest, log}) {
    this.baseUri = `https://${config.zone}-search.doofinder.com/5/`
    this.hashId = config.hashId
    this.authKey = config.authKey
    this.filterMap = config.filterMap
    this.tracedRequest = tracedRequest
    this.log = log
  }

  /**
   * @param {Object} params
   * @param {String} endpoint
   *
   * @return {String}
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
   *
   * @return {Object}
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
   *
   * @returns {Object}
   */
  async getSearchSuggestions (query) {
    const suggestions = []
    const response = await this.request({query}, 'suggest')

    for (const result of response.results) {
      suggestions.push(result.term.charAt(0).toUpperCase() + result.term.slice(1))
    }

    return { suggestions }
  }

  /**
   * @param {PipelineInput} param0
   *
   * @return {Object}
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

  /**
   * @param {PipelineInput} param0
   *
   * @return {Object}
   */
  async getFilters ({searchPhrase, categoryPath}) {
    this.log.info(`Search filter for query "${searchPhrase}" and/or category "${categoryPath}"`)
    const response = await this.request({query: searchPhrase})
    const filters = []

    for (let [key, value] of Object.entries(response.facets)) {
      if (['grouping_count'].includes(key)) { continue }
      filters.push({
        id: key,
        label: this.filterMap[key] ? this.filterMap[key] : key,
        source: 'doofinder',
        type: value.range ? 'range' : 'multiselect',
        minimum: value.range ? Math.floor(value.range.buckets[0].stats.min * 100) : undefined,
        maximum: value.range ? Math.ceil(value.range.buckets[0].stats.max * 100) : undefined,
        values: value.terms ? value.terms.buckets.map(element => {
          return {
            id: element.key,
            label: element.key,
            hits: element.docCount
          }
        }) : undefined
      })
    }

    return { filters }
  }
}

module.exports = Client
