const DoofinderClient = require('./doofinder/Client')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @returns {Promise<Object>}
 */
module.exports = async (context, input) => {
  const client = new DoofinderClient(context.config, context.tracedRequest)
  let suggestions = await client.searchSuggestions({query: input.searchPhrase})
  return { suggestions }
}
