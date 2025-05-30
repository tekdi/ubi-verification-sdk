const VerifierFactory = require("./verifiers/VerifierFactory");

class VerificationService {
  /**
   * Main method to verify a credential using config and optional eligibility rules
   * @param {Object} credential
   * @param {Object} config - includes issuerName, etc.
   */
  async verify(payload) {
    try {
      const { credential, config = {} } = payload;
      const verifier = VerifierFactory.getVerifier(config);
      const result = await verifier.verify(credential);
      console.log("Verification result:", result);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }
}

module.exports = new VerificationService();
