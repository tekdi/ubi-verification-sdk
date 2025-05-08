const Ajv = require('ajv');
const ajv = new Ajv();
require('ajv-formats')(ajv);

class ValidationService {
  constructor() {
    this.validators = new Map();
  }

  /**
   * Get or create validator for a schema
   * @param {String} key - Validator key
   * @param {Object} schema - Validation schema
   * @returns {Function} Validator function
   */
  getValidator(key, schema) {
    if (!this.validators.has(key)) {
      const validator = ajv.compile(schema);
      this.validators.set(key, validator);
    }
    return this.validators.get(key);
  }
}

module.exports = new ValidationService();