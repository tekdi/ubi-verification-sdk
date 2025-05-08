const axios = require('axios');
require('dotenv').config();

class VerificationService {
  /**
   * Verifies a credential using either a remote verification API endpoint or the standalone verification library.
   * 
   * @param {Object} credential - The credential JSON to be verified.
   * @param {Object} config - Configuration object containing verification options.
   * @param {Object} [eligibility_rules=null] - Eligibility rules for additional checks (optional).
   * 
   * @returns {Object} - The result of the verification process, including success status, message, and additional details.
   */
  async verify(credential, config = {}, eligibility_rules = null) {
    try {
      let verificationResult;
      let errorMessage = '';

      // Set default method to "verify_using_api" if config.method is not provided
      const method = config?.method || "verify_using_api";
      console.log("Verification method:", method);

      if (method === "verify_using_signature") {
        // Use the standalone verification library
        verificationResult = {
          success: false,
          message: 'Credential verification failed.'
        };
      } else if (method === "verify_using_api") {
        // Use the remote verification_api_endpoint for verification
        const response = await axios.post(`${process.env.verification_api_endpoint}/verify`, credential);
        const error = response?.data?.error;
        const checks = response?.data?.checks;

        const errors = [];
        for (const check of checks) {
          if (check.isValid == false) {
            errorMessage = check.message || 'Unknown error in check.';
            errors.push({ "error": errorMessage });
          }
        }

        if (error && error.length > 0) {
          if (Array.isArray(error)) {
            for (const err of error) {
              errorMessage = err.message || 'Unknown error in check.';
              errors.push({ "error": errorMessage });
            }
          } else if (error.message) {
            errors.push({ "error": error.message });
          } else {
            errorMessage = check.message || 'Unknown error in check.';
            errors.push({ "error": errorMessage });
          }

          return {
            success: false,
            message: 'Credential verification failed.',
            errors: errors
          };
        }

        verificationResult = {
          success: true,
          message: 'Credential verified successfully.',
          checks: checks
        };
      } else {
        return {
          success: false,
          message: 'Invalid configuration: Either verify_using_signature or verification_api_endpoint must be specified.',
        };
      }

      // If verification is successful, check eligibility rules
      if (verificationResult.success && eligibility_rules) {
        const isEligible = this.checkEligibilityRules(credential, eligibility_rules);
        if (!isEligible) {
          return {
            success: false,
            message: 'Credential verification passed, but eligibility rules failed.'
          };
        }
      }

      return verificationResult;
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred during credential verification.',
        error: error.message
      };
    }
  }

  /**
   * Checks if the credential satisfies the provided eligibility rules.
   * 
   * @param {Object} credential - The credential JSON to be checked.
   * @param {Object} eligibility_rules - The eligibility rules to validate against.
   * 
   * @returns {boolean} - Whether the credential satisfies the eligibility rules.
   */
  checkEligibilityRules(credential, eligibility_rules) {
    // Implement your eligibility rules logic here
    // For example, check specific fields in the credential against the rules
    // Return true if the credential satisfies the rules, otherwise false
    return true; // Placeholder implementation
  }
}

module.exports = new VerificationService();