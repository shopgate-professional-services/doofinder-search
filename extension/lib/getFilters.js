const DoofinderClient = require('./doofinder/Client')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @returns {Promise<Object>}
 */
module.exports = async (context, input) => {
  const { filters } = await new DoofinderClient(context).getFilters(input.searchPhrase)

  const { filterPriority = { price: -1 } } = context.config

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
