// @ts-check

/**
 * The Validator interface declares a method for building the chain of validators. It also declares a method for executing a request.
 *
 * @interface
 */
class PackageValidator {
  /**
   * Set next package validator.
   *
   * @param {PackageValidator} validator Validator.
   * @return {PackageValidator} Package validator.
   */
  setNext(validator) {
    throw new Error('Needs to be implemented by the subclass.');
  }

  /**
   * Is valid.
   *
   * @param {Buffer} pkg Package.
   * @return {boolean} Boolean.
   */
  isValid(pkg) {
    throw new Error('Needs to be implemented by the subclass.');
  }
}

export default PackageValidator;
