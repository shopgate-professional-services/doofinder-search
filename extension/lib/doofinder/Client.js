'use strict'
const { promisify } = require('util')

class Client {
  /**
   * @param {Object} config
   */
  constructor ({ config, tracedRequest, log }) {
    this.baseUri = `https://${config.zone}-search.doofinder.com/5/`
    this.hashId = config.hashId
    this.authKey = config.authKey
    this.filterMap = config.filterMap
    this.productIdKey = config.productIdKey
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
      qs: { ...{ hashid: this.hashId }, ...params },
      headers: {
        Authorization: this.authKey
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
   * @param {Object} filters
   * @param {Number} offset
   * @param {Number} limit
   * @param {Object} sort
   *
   * @return {Object}
   */
  async paginatedRequest (query, filters, offset, limit, sort) {
    const rpp = limit < 100 ? limit : 100
    const firstPage = Math.floor(offset / rpp) + 1
    const lastPage = Math.ceil((offset + limit) / rpp)
    const skipCount = offset % rpp
    let results = []
    let totalProductCount = 0

    for (let currentPage = firstPage; currentPage <= lastPage; currentPage++) {
      const response = await this.request({ query, rpp, filter: filters, page: currentPage, sort })
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
    const response = await this.request({ query }, 'suggest')

    return {
      suggestions: response.results.map(
        result => result.term.charAt(0).toUpperCase() + result.term.slice(1)
      )
    }
  }

  /**
   * @param {PipelineInput} param0
   *
   * @return {Object}
   */
  async searchProducts ({ searchPhrase, filters, offset = 0, limit = 10, sort }) {
    const response = await this.paginatedRequest(
      searchPhrase,
      this.prepareFilters(filters),
      offset,
      limit,
      this.prepareSort(sort)
    )

    return {
      productIds: response.results.map(result => result[this.productIdKey]),
      totalProductCount: response.totalProductCount
    }
  }

  /**
   * @param {String} query
   *
   * @return {Object}
   */
  async getFilters (query) {
    const response = await this.request({ query })
    const filters = []

    for (const [key, value] of Object.entries(response.facets)) {
      if (['grouping_count'].includes(key)) { continue }
      if (value.terms && value.terms.buckets && value.terms.buckets.length <= 1) { continue }
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

  /**
   * @param {Object} filters
   *
   * @return {Object}
   */
  prepareFilters (filters = {}) {
    const searchFilters = {}
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'price') {
        searchFilters.price = {
          gte: value.minimum / 100,
          lt: value.maximum / 100
        }
      } else {
        searchFilters[key] = value.values.map(val => val)
      }
    }

    return searchFilters
  }

  /**
   * @param {String} sort
   *
   * @return {Object}
   */
  prepareSort (sort) {
    return {
      price: sort === 'priceDesc' ? 'desc' : sort === 'priceAsc' ? 'asc' : undefined
    }
  }
}

module.exports = Client
