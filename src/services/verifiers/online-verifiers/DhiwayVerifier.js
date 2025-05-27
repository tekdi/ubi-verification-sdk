const axios = require('axios');
const VerifierInterface = require('../VerifierInterface');
const { translateError } = require('../../../utils/errorTranslator');

class DhiwayVerifier extends VerifierInterface {
  constructor(config = {}) {
    super(config);
    this.apiEndpoint = config.apiEndpoint;
  }

  async verify(credential) {
    try {
      if (!this.apiEndpoint) {
        return { success: false, message: 'API endpoint is not set.' };
      }
      if (!credential || typeof credential !== 'object' || Array.isArray(credential) || 
      Object.keys(credential).length === 0) {
        return { success: false, message: 'Invalid credential format. Expected a non-empty object.' };
      }
      const response = await axios.post(this.apiEndpoint, credential);
      const error = response?.data?.error;
      const checks = response?.data?.checks;

      const errors = [];
      for (const check of checks || []) {
        if (check.isValid === false) {
          errors.push({
            error: translateError(check.message || 'Unknown error in check'),
            raw: check.message || 'Unknown error in check'
          });
        }
      }

      if (error && error.length > 0) {
        if (Array.isArray(error)) {
          for (const err of error) {
            errors.push({
              error: translateError(err.message || 'Unknown error in check'),
              raw: err.message || 'Unknown error in check'
            });
          }
        } else {
          errors.push({
            error: translateError(error.message || 'Unknown error in check'),
            raw: error.message || 'Unknown error in check'
          });
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

module.exports = DhiwayVerifier;