const Client = require('./Client')

class ClientFactory {
  /**
   * @param {PipelineConfiguration} config
   * @param {function} tracedRequest
   * @returns {Client}
   */
  static create (config, tracedRequest) {
    return new Client(
      config.baseUri,
      config.hashId,
      config.authHeader,
      tracedRequest
    )
  }
}

module.exports = ClientFactory
