const DoofinderClient = require('./doofinder/Client')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @returns {Promise<Object>}
 */
module.exports = async (context, input) => {
  const client = new DoofinderClient(context)
  let results = await client.searchProducts(input)
  return results
}
