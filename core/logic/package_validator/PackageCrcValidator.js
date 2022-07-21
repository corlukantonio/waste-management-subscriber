// @ts-check

//#region Imports

// Core - Logic
import LogHandler from '../LogHandler';
import PackageAbstractValidator from './PackageAbstractValidator';
import PackageParser from '../PackageParser';

// Core - Data
import common from '../../data/common';

//#endregion

/**
 * Package CRC validator.
 *
 * @extends PackageAbstractValidator
 */
class PackageCrcValidator extends PackageAbstractValidator {
  /**
   * CRC.
   *
   * @type {number}
   */
  #pkgCrc;

  constructor() {
    super();

    /**
     * Set package CRC.
     *
     * @param {number} pkgCrc Package CRC.
     */
    this.setPkgCrc = (pkgCrc) => {
      this.#pkgCrc = pkgCrc;
    };
  }

  /**
   * Is valid.
   *
   * @param {Buffer} pkg Package.
   * @return {boolean} Boolean.
   */
  isValid(pkg) {
    if (this.#pkgCrc === PackageParser.getInstance().getCrc(pkg.slice(0, -1))) {
      return super.isValid(pkg);
    }

    console.log(
      LogHandler.getInstance().getLogMessage(common.LOG_MSG_TYPES.ERR_PKG_CRC)
    );

    return false;
  }
}

export default PackageCrcValidator;
