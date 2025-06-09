const axios = require("axios");
const VerifierInterface = require("../VerifierInterface");
class DhiwayVerifier extends VerifierInterface {
  constructor() {
    super();
    this.apiEndpoint = process.env.DHIWAY_VERIFIER_VERIFICATION_API;
    this.apiToken = process.env.DHIWAY_VERIFIER_VERIFICATION_API_TOKEN;
    if (!this.apiEndpoint) {
      throw new Error("DHIWAY_VERIFIER_VERIFICATION_API environment variable is not set.");
    }
    if (!this.apiToken) {
      throw new Error("DHIWAY_VERIFIER_VERIFICATION_API_TOKEN environment variable is not set.");
    }
  }

  errorTranslator = {
    "Failed to verify CordProof2024":
      "The credential's authenticity couldn't be verified. It may be expired, revoked, altered, or issued by an untrusted source.",
    "Error verifyDisclosedAttributes":
      "Some information in the credential couldn't be verified. Please ensure the credential is complete and hasn't been modified.",
    "Unknown error in check":
      "An unexpected issue occurred during credential verification. Please try again later.",
  };

  translateResponse(response) {
    const error = response?.data?.error;
    let formattedErrors = [];
    if (error && (Array.isArray(error) ? error.length > 0 : true)) {
      const pushError = (errObj) => ({
        error:
          this.errorTranslator[errObj.message] ||
          "An unknown error occurred during verification.",
        raw: errObj.message || "An unknown error occurred",
      });
      if (Array.isArray(error)) {
        formattedErrors = error.map(pushError);
      } else {
        formattedErrors = [pushError(error)];
      }
    }

    if (formattedErrors.length > 0) {
      return {
        success: false,
        message: "Credential verification failed.",
        errors: formattedErrors,
      };
    }

    return {
      success: true,
      message: "Credential verified successfully.",
    };
  }

  async verify(credential) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        credential,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return this.translateResponse(response);
    } catch (error) {
      return {
        success: false,
        message: "Verification API error",
        errors: [
          {
            error: error.message,
            raw: error.message,
          },
        ],
      };
    }
  }
}

module.exports = DhiwayVerifier;
