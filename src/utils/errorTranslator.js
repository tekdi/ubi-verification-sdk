const errorTranslator = {
  "verifyDisclosed Attribute": "Some information in the credential couldn't be verified. Please ensure the credential is complete and hasn't been modified.",
  "Failed to verify CordProof2024": "The credential's authenticity couldn't be verified. It may be expired, revoked, altered, or issued by an untrusted source.",
  "Error verifyDisclosedAttributes": "Some information in the credential couldn't be verified. Please ensure the credential is complete and hasn't been modified.",
  "Unknown error in check": "An unexpected issue occurred during credential verification. Please try again later."
};

function translateError(rawMessage) {
  return errorTranslator[rawMessage] || "An unknown error occurred during verification.";
}

module.exports = { translateError };