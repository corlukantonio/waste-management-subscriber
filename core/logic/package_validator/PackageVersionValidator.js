// @ts-check

//#region Imports

// Core - Logic
import LogHandler from '../LogHandler';
import PackageAbstractValidator from './PackageAbstractValidator';

// Core - Data
import common from '../../data/common';

//#endregion

/**
 * Package version validator.
 *
 * @extends PackageAbstractValidator
 */
class PackageVersionValidator extends PackageAbstractValidator {
  /**
   * Package version.
   *
   * @type {number}
   */
  #pkgVersion;

  constructor() {
    super();

    /**
     * Set package version.
     *
     * @param {number} pkgVersion Package version
     */
    this.setPkgVersion = (pkgVersion) => {
      this.#pkgVersion = pkgVersion;
    };
  }

  /**
   * Is valid.
   *
   * @param {Buffer} pkg Package.
   * @return {boolean} Boolean.
   */
  isValid(pkg) {
    if (pkg[1] === this.#pkgVersion) {
      return super.isValid(pkg);
    }

    console.log(
      LogHandler.getInstance().getLogMessage(
        common.LOG_MSG_TYPES.ERR_PKG_VERSION,
        pkg[1]
      )
    );

    return false;
  }
}

export default PackageVersionValidator;
