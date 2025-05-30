class VerifierInterface {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Verifies a credential.
   * Should return:
   *   On success:
   *     { success: true, message: "Credential verified successfully." }
   *   On failure:
   *     { success: false, message: "...", errors: [{ error: "...", raw: "..." }] }
   * @param {Object} credential
   * @returns {Promise<Object>}
   */
  async verify(credential) {
    throw new Error('verify() must be implemented by subclass');
  }
}

module.exports = VerifierInterface;
