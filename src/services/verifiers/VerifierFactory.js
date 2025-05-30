const SignatureVerifier = require('./offline-verifier/SignatureVerifier');

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
      try {
        // Validate verifierName
        if (!/^[a-zA-Z]+$/.test(verifierName)) {
          throw new Error('Invalid verifier name format');
        }
        // Capitalize first letter and append 'Verifier'
        const className = verifierName.charAt(0).toUpperCase() + verifierName.slice(1) + 'Verifier';
        // Dynamically require the verifier class
        const VerifierClass = require(`./online-verifiers/${className}`);
        return new VerifierClass(config);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Error loading verifier: ${err.message}`);
        }
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
