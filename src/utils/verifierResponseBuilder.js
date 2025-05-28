//Common Response Builder for Verifier
function buildVerifierResponse({ success, message, errors = [] }) {
  if (success) {
    return {
      success: true,
      message: message || 'Credential verified successfully.'
    };
  } else {
    return {
      success: false,
      message: message || 'Credential verification failed.',
      errors: errors
    };
  }
}

module.exports = { buildVerifierResponse };