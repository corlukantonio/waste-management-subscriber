// @ts-check

//#region Imports

// Core - Data
const common = require('../data/common');
const typedefs = require('../data/typedefs');

//#endregion

/**
 * Class for package parsing.
 */
class PackageParser {
  /**
   * One and only instance of the class.
   *
   * @type {PackageParser}
   */
  static #instance;

  /**
   * @private
   */
  constructor() {}

  /**
   * Get class instance.
   *
   * @return {PackageParser} Instance.
   */
  static getInstance() {
    if (!PackageParser.#instance) {
      PackageParser.#instance = new PackageParser();
    }

    return PackageParser.#instance;
  }

  /**
   * Get object registration request (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {typedefs.ObjectRegistrationRequest} Object registration request.
   */
  objectRegistrationRequestV1(buff) {
    /**
     * Parsed package.
     *
     * @type {typedefs.ObjectRegistrationRequest}
     */
    let parsedPackage = {
      packageType: 0x00,
      packageVersion: 0x00,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      crc: 0x00,
    };

    /**
     * Counter.
     *
     * @type {number}
     */
    let i = 0;

    if (buff.byteLength > 0) {
      parsedPackage.packageType = buff[i++];
      parsedPackage.packageVersion = buff[i++];
      parsedPackage.mac = Buffer.from([
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ]);
      parsedPackage.rtc = [
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ];
      parsedPackage.crc = buff[i];
    }

    return parsedPackage;
  }

  /**
   * Get object activation request (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {typedefs.ObjectActivationRequest} Object activation request.
   */
  getObjectActivationRequestV1(buff) {
    /**
     * Parsed package.
     *
     * @type {typedefs.ObjectActivationRequest}
     */
    let parsedPackage = {
      packageType: 0x00,
      packageVersion: 0x00,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      activationCode: Buffer.from([0x00, 0x00, 0x00, 0x00]),
      crc: 0x00,
    };

    /**
     * Counter.
     *
     * @type {number}
     */
    let i = 0;

    if (buff.byteLength > 0) {
      parsedPackage.packageType = buff[i++];
      parsedPackage.packageVersion = buff[i++];
      parsedPackage.mac = Buffer.from([
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ]);
      parsedPackage.rtc = [
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ];
      parsedPackage.activationCode = Buffer.from([
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ]);
      parsedPackage.crc = buff[i];
    }

    return parsedPackage;
  }

  /**
   * Get object record (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {typedefs.ObjectRecord} Object record.
   */
  getObjectRecordV1(buff) {
    /**
     * Parsed package.
     *
     * @type {typedefs.ObjectRecord}
     */
    let parsedPackage = {
      packageType: 0x00,
      packageVersion: 0x00,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      numberOfValues: 0,
      values: {},
      rssi: 0,
      crc: 0x00,
    };

    /**
     * Counter.
     *
     * @type {number}
     */
    let i = 0;

    if (buff.byteLength > 0) {
      parsedPackage.packageType = buff[i++];
      parsedPackage.packageVersion = buff[i++];
      parsedPackage.mac = Buffer.from([
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ]);
      parsedPackage.rtc = [
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
        buff[i++],
      ];
      parsedPackage.numberOfValues = buff[i++];

      for (let j = 0; j < parsedPackage.numberOfValues; j++) {
        switch (buff[i]) {
          case common.VAL_TYPES.DISTANCE:
            i++;

            parsedPackage.values.distance = Buffer.from([
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
            ]).readDoubleLE(0);

            break;

          case common.VAL_TYPES.HUMIDITY:
            i++;

            parsedPackage.values.humidity = Buffer.from([
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
            ]).readDoubleLE(0);

            break;

          case common.VAL_TYPES.TEMPERATURE_CELSIUS:
            i++;

            parsedPackage.values.temperatureCelsius = Buffer.from([
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
              buff[i++],
            ]).readDoubleLE(0);

            break;

          default:
            break;
        }
      }

      parsedPackage.rssi = Buffer.from([buff[i++], buff[i++]]).readInt16LE(0);
      parsedPackage.crc = buff[i];
    }

    return parsedPackage;
  }

  /**
   * Get object record (v1) values length.
   *
   * @param {Buffer} buff Buffer.
   * @return {number} Values length.
   */
  getObjectRecordV1ValuesLength(buff) {
    /**
     * Counter.
     *
     * @type {number}
     */
    let i = 14;

    /**
     * Length.
     *
     * @type {number}
     */
    let length = 0;

    /**
     * Number of values.
     *
     * @type {number}
     */
    let numberOfValues = buff[i++];

    for (let j = 0; j < numberOfValues; j++) {
      switch (buff[i]) {
        case common.VAL_TYPES.DISTANCE:
          i += common.VAL_LENGTHS.DISTANCE;
          length += common.VAL_LENGTHS.DISTANCE;

          break;

        case common.VAL_TYPES.HUMIDITY:
          i += common.VAL_LENGTHS.HUMIDITY;
          length += common.VAL_LENGTHS.HUMIDITY;

          break;

        case common.VAL_TYPES.TEMPERATURE_CELSIUS:
          i += common.VAL_LENGTHS.TEMPERATURE_CELSIUS;
          length += common.VAL_LENGTHS.TEMPERATURE_CELSIUS;

          break;

        default:
          break;
      }
    }

    return length;
  }
}

module.exports = PackageParser;
