// @ts-check

//#region Imports

// Core - Logic - Package validator
const PackageCrcValidator = require('../package_validator/PackageCrcValidator');
const PackageLengthValidator = require('../package_validator/PackageLengthValidator');
const PackageTypeValidator = require('../package_validator/PackageTypeValidator');
const PackageVersionValidator = require('../package_validator/PackageVersionValidator');

// Core - Data
const types = require('../../data/types');

//#endregion

/**
 * The Abstract Class defines a template method that contains a skeleton of some algorithm, composed of calls to (usually) abstract primitive operations. Concrete subclasses should implement these operations, but leave the template method itself intact.
 *
 * @abstract
 */
class MqttMessageHandler {
  /**
   * Message.
   *
   * @type {Buffer}
   */
  #msg;

  /**
   * Package type.
   *
   * @type {number}
   */
  #pkgType;

  /**
   * Package version.
   *
   * @type {number}
   */
  #pkgVersion;

  /**
   * Package length.
   *
   * @type {number}
   */
  #pkgLength;

  /**
   * Package CRC.
   *
   * @type {number}
   */
  #pkgCrc;

  /**
   * Package type validator.
   *
   * @type {PackageTypeValidator}
   */
  #pkgTypeValidator = new PackageTypeValidator();

  /**
   * Package version validator.
   *
   * @type {PackageVersionValidator}
   */
  #pkgVersionValidator = new PackageVersionValidator();

  /**
   * Package length validator.
   *
   * @type {PackageLengthValidator}
   */
  #pkgLengthValidator = new PackageLengthValidator();

  /**
   * Package CRC validator.
   *
   * @type {PackageCrcValidator}
   */
  #pkgCrcValidator = new PackageCrcValidator();

  /**
   * Constructor.
   *
   * @param {Buffer} msg Message.
   * @param {number} pkgType Package type.
   * @param {number} pkgVersion Package version.
   * @param {number} pkgLength Package length.
   * @param {number} pkgCrc Package CRC.
   */
  constructor(msg, pkgType, pkgVersion, pkgLength, pkgCrc) {
    this.#msg = msg;
    this.#pkgType = pkgType;
    this.#pkgVersion = pkgVersion;
    this.#pkgLength = pkgLength;
    this.#pkgCrc = pkgCrc;

    this.#pkgTypeValidator
      .setNext(this.#pkgVersionValidator)
      .setNext(this.#pkgLengthValidator)
      .setNext(this.#pkgCrcValidator);
  }

  handleMessage() {
    if (
      this.isValid(
        this.#msg,
        this.#pkgType,
        this.#pkgVersion,
        this.#pkgLength,
        this.#pkgCrc
      )
    ) {
      /**
       * Package.
       *
       * @type {types.ObjectActivationRequest | types.ObjectRecord | types.ObjectRegistrationRequest}
       */
      let pkg = this.getPackage();

      this.setQueries();
      this.doMain(pkg);
    }
  }

  /**
   * Is valid.
   *
   * @private
   * @param {Buffer} msg Message.
   * @param {number} pkgType Package type.
   * @param {number} pkgVersion Package version.
   * @param {number} pkgLength Package length.
   * @param {number} pkgCrc Package CRC.
   * @return {boolean}
   */
  isValid(msg, pkgType, pkgVersion, pkgLength, pkgCrc) {
    this.#pkgTypeValidator.setPkgType(pkgType);
    this.#pkgVersionValidator.setPkgVersion(pkgVersion);
    this.#pkgLengthValidator.setPkgLength(pkgLength);
    this.#pkgCrcValidator.setPkgCrc(pkgCrc);

    if (this.#pkgTypeValidator.isValid(msg)) {
      return true;
    }

    return false;
  }

  /**
   * Get package.
   *
   * @protected
   * @return {types.ObjectActivationRequest | types.ObjectRecord | types.ObjectRegistrationRequest} Package.
   */
  getPackage() {
    throw new Error('Needs to be implemented by the subclass.');
  }

  /**
   * Set queries.
   *
   * @return {void}
   */
  setQueries() {
    throw new Error('Needs to be implemented by the subclass.');
  }

  /**
   * Do main.
   *
   * @param {types.ObjectActivationRequest | types.ObjectRecord | types.ObjectRegistrationRequest} pkg Package.
   * @return {void}
   */
  doMain(pkg) {
    throw new Error('Needs to be implemented by the subclass.');
  }
}

module.exports = MqttMessageHandler;
