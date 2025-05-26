class VerifierInterface {
    /**
     * Verifies a credential.
     * @param {Object} credential 
     * @returns {Promise<Object>} verification result
     */
    async verify(credential) {
      throw new Error('verify() must be implemented by subclass');
    }
  }
  
  module.exports = VerifierInterface;
  