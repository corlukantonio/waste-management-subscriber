// @ts-check

//#region Imports

// Core - Logic
const LogHandler = require('../LogHandler');
const PackageAbstractValidator = require('./PackageAbstractValidator');

// Core - Data
const common = require('../../data/common');

//#endregion

/**
 * Package type validator.
 *
 * @extends PackageAbstractValidator
 */
class PackageTypeValidator extends PackageAbstractValidator {
  /**
   * Package type.
   *
   * @type {number}
   */
  #pkgType;

  constructor() {
    super();

    /**
     * Set package type.
     *
     * @param {number} pkgType Package type.
     */
    this.setPkgType = (pkgType) => {
      this.#pkgType = pkgType;
    };
  }

  /**
   * Is valid.
   *
   * @param {Buffer} pkg Package.
   * @return {boolean} Boolean.
   */
  isValid(pkg) {
    if (pkg[0] === this.#pkgType) {
      return super.isValid(pkg);
    }

    console.log(
      LogHandler.getInstance().getLogMessage(
        common.LOG_MSG_TYPES.ERR_PKG_TYPE,
        this.#pkgType,
        pkg[0]
      )
    );

    return false;
  }
}

module.exports = PackageTypeValidator;
