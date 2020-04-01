const ClientFactory = require('./doofinder/ClientFactory')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @returns {Promise<Object>}
 */
module.exports = async (context, input) => {
  const client = ClientFactory.create(context.config, context.tracedRequest)
  let suggestions = await client.searchSuggestions({query: input.searchPhrase})
  return { suggestions }
}
