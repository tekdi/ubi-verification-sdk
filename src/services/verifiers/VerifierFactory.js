const SignatureVerifier = require('./offline-verifier/SignatureVerifier');
const DhiwayVerifier = require('./online-verifiers/DhiwayVerifier');

class VerifierFactory {
  /**
   * Returns the appropriate Verifier based on config.
   * @param {Object} config - includes verifierName and other config
   */
  static getVerifier(config = {}) {
    const { method = 'online', verifierName } = config;

    if (method === 'online') {
      if (!verifierName) {
        throw new Error('verifierName is required for online verification');
      }
      // For multiple online verifiers, extend this logic
      if (verifierName === 'dhiway') {
        return new DhiwayVerifier(config);
      } else {
        throw new Error(`Unknown online verifier: ${verifierName}`);
      }
    } else if (method === 'offline') {
      // For offline, default to SignatureVerifier or extend as needed
      return new SignatureVerifier(config);
    } else {
      throw new Error(`Unknown verification method: ${method}`);
    }
  }
}

module.exports = VerifierFactory;
