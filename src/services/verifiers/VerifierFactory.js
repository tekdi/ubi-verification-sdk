const ApiVerifier = require('./ApiVerifier');
const SignatureVerifier = require('./SignatureVerifier');

class VerifierFactory {
  /**
   * Returns the appropriate Verifier based on config.
   * @param {Object} config - includes method and endpoint
   */
  static getVerifier(config = {}) {
    const method = config.method || 'online';
    const endpoint = config?.apiEndpoint;

    switch (method) {
      case 'online':
        return new ApiVerifier(endpoint);

      case 'offline':
        return new SignatureVerifier();

      default:
        throw new Error(`Unknown verification method: ${method}`);
    }
  }
}

module.exports = VerifierFactory;
