const axios = require('axios');
const VerifierInterface = require('./VerifierInterface');

class ApiVerifier extends VerifierInterface {
  /**
   * @param {string} apiEndpoint - The endpoint to call for verification
   */
  constructor(apiEndpoint) {
    super();
    this.apiEndpoint = apiEndpoint;
  }

  async verify(credential) {
    try {
        console.log('Verifying credential using API:', credential);
        console.log('apiEndpoint using API:', this.apiEndpoint);
      const response = await axios.post(`${this.apiEndpoint}/verify`, credential);
      const error = response?.data?.error;
      const checks = response?.data?.checks;

      const errors = [];
      for (const check of checks || []) {
        if (check.isValid === false) {
          errors.push({ error: check.message || 'Unknown error in check' });
        }
      }

      if (error && error.length > 0) {
        if (Array.isArray(error)) {
          for (const err of error) {
            errors.push({ error: err.message || 'Unknown error in check' });
          }
        } else {
          errors.push({ error: error.message || 'Unknown error in check' });
        }

        return {
          success: false,
          message: 'Credential verification failed.',
          errors
        };
      }

      return {
        success: true,
        message: 'Credential verified successfully.',
        checks
      };
    } catch (error) {
      return {
        success: false,
        message: 'Verification API error',
        error: error.message
      };
    }
  }
}

module.exports = ApiVerifier;
