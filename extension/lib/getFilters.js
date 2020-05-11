const DoofinderClient = require('./doofinder/Client')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @returns {Promise<Object>}
 */
module.exports = async (context, input) => {
  const { filters } = await new DoofinderClient(context).getFilters(input.searchPhrase)

  // move price filter to top
  filters.sort((x, y) => x.id === 'price' ? -1 : y.id === 'price' ? 1 : 0)

  return { filters }
}
