// @ts-check

//#region Imports

// Core - Logic
const PackageValidator = require('./PackageValidator');

//#endregion

/**
 * The default chaining behavior can be implemented inside a base validator class.
 *
 * @abstract
 * @implements {PackageValidator}
 */
class PackageAbstractValidator {
  /**
   * Next validator.
   *
   * @type {PackageValidator}
   */
  #nextValidator;

  /**
   * Set next package validator.
   *
   * @param {PackageValidator} validator Validator.
   * @return {PackageValidator} Package validator.
   */
  setNext(validator) {
    this.#nextValidator = validator;

    return this.#nextValidator;
  }

  /**
   * Is valid.
   *
   * @param {Buffer} pkg Package.
   * @return {boolean} Boolean.
   */
  isValid(pkg) {
    if (this.#nextValidator) {
      return this.#nextValidator.isValid(pkg);
    }

    /**
     * This is the end of the chain, so the package is apparently fine.
     */

    return true;
  }
}

module.exports = PackageAbstractValidator;
