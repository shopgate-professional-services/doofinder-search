const DoofinderClient = require('./doofinder/Client')
const config = require('../config')

const { filterPriority = { price: -1 } } = config

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @returns {Promise<Object>}
 */
module.exports = async (context, input) => {
  const { filters } = await new DoofinderClient(context).getFilters(input.searchPhrase)

  if (filterPriority) {
    // move price filter to top
    filters.sort((x, y) => {
      const priorityX = filterPriority[x.id]
      if (priorityX) {
        return priorityX
      }
      const priorityY = filterPriority[y.id]
      return priorityY ? -priorityY : 0
    })
  }

  return { filters }
}
