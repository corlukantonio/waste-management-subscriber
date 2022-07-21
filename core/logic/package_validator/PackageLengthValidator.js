// @ts-check

//#region Imports

// Core - Logic
import LogHandler from '../LogHandler';
import PackageAbstractValidator from './PackageAbstractValidator';

// Core - Data
import common from '../../data/common';

//#endregion

/**
 * Package length validator.
 *
 * @extends PackageAbstractValidator
 */
class PackageLengthValidator extends PackageAbstractValidator {
  /**
   * Package length.
   *
   * @type {number}
   */
  #pkgLength;

  constructor() {
    super();

    /**
     * Set package length.
     *
     * @param {number} pkgLength Package length.
     */
    this.setPkgLength = (pkgLength) => {
      this.#pkgLength = pkgLength;
    };
  }

  /**
   * Is valid.
   *
   * @param {Buffer} pkg Package.
   * @return {boolean} Boolean.
   */
  isValid(pkg) {
    if (pkg.byteLength === this.#pkgLength) {
      return super.isValid(pkg);
    }

    console.log(
      LogHandler.getInstance().getLogMessage(
        common.LOG_MSG_TYPES.ERR_PKG_LEN,
        this.#pkgLength,
        pkg.byteLength
      )
    );

    return false;
  }
}

export default PackageLengthValidator;
