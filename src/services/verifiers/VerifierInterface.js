class VerifierInterface {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Verifies a credential.
   * @param {Object} credential
   * @returns {Promise<Object>}
   */
  async verify(credential) {
    throw new Error('verify() must be implemented by subclass');
  }
}

module.exports = VerifierInterface;
