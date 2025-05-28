const axios = require("axios");
const VerifierInterface = require("../VerifierInterface");
const { translateError } = require("../../../utils/errorTranslator");
const { buildVerifierResponse } = require("../../../utils/verifierResponseBuilder");

class DhiwayVerifier extends VerifierInterface {
  constructor(config = {}) {
    super(config);
    this.apiEndpoint = config.apiEndpoint;
  }

  processVerificationResponse(response) {
    const error = response?.data?.error;
    let formattedErrors = [];
    if (error && error.length > 0) {
      const pushError = (errObj) => ({
        error: translateError(errObj.message || "Unknown error"),
        raw: errObj.message || "Unknown error",
      });
      if (Array.isArray(error)) {
        formattedErrors = error.map(pushError);
      } else {
        formattedErrors = [pushError(error)];
      }
    }

    if (formattedErrors.length > 0) {
      return buildVerifierResponse({
        success: false,
        message: "Credential verification failed.",
        errors: formattedErrors,
      });
    }

    return buildVerifierResponse({
      success: true,
      message: "Credential verified successfully.",
    });
  }

  async verify(credential) {
    try {
      const response = await axios.post(this.apiEndpoint, credential);
      return this.processVerificationResponse(response);
    } catch (error) {
      return buildVerifierResponse({
        success: false,
        message: "Verification API error",
        errors: [
          {
            error: error.message,
            raw: error.message,
          },
        ],
      });
    }
  }
}

module.exports = DhiwayVerifier;
