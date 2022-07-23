// @ts-check

//#region Imports

// Core - Data
const common = require('../data/common');
const types = require('../data/types');

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
   * Counter.
   *
   * @type {number}
   */
  #i = 0;

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
   * Get MAC.
   *
   * @param {Buffer} buff Buffer.
   * @return {Buffer} MAC.
   */
  getMac(buff) {
    /**
     * MAC.
     *
     * @type {Buffer}
     */
    let mac = Buffer.from([
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
    ]);

    return mac;
  }

  /**
   * Get RTC.
   *
   * @param {Buffer} buff Buffer.
   * @return {Array.<Number>} RTC.
   */
  getRtc(buff) {
    /**
     * RTC.
     *
     * @type {Array.<Number>}
     */
    let rtc = [
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
    ];

    return rtc;
  }

  /**
   * Get 8 bytes byte array.
   *
   * @param {Buffer} buff Buffer.
   * @return {Array.<Number>} Byte array.
   */
  get8BytesByteArr(buff) {
    /**
     * Byte array.
     *
     * @type {Array.<Number>}
     */
    let byteArr = [
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
    ];

    return byteArr;
  }

  /**
   * Get 8 bytes buffer.
   *
   * @param {Buffer} buff Buffer.
   * @return {Buffer} Buffer.
   */
  get8BytesBuffer(buff) {
    /**
     * Buffer.
     *
     * @type {Buffer}
     */
    let val = Buffer.from([
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
      buff[this.#i++],
    ]);

    return val;
  }

  /**
   * Get CRC.
   *
   * @param {Buffer} buff Buffer.
   * @return {number} CRC.
   */
  getCrc(buff) {
    /**
     * CRC.
     *
     * @type {number}
     */
    let crc = 0x00;

    for (let j = 0; j < buff.byteLength - 1; j++) {
      crc += j * buff[j];

      while (crc >= 256) {
        crc -= 256;
      }
    }

    return crc;
  }

  /**
   * Get object registration request (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {types.ObjectRegistrationRequest} Object registration request.
   */
  objectRegistrationRequestV1(buff) {
    /**
     * Parsed package.
     *
     * @type {types.ObjectRegistrationRequest}
     */
    let parsedPackage = {
      packageType: 0x00,
      packageVersion: 0x00,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      crc: 0x00,
    };

    this.#i = 0;

    if (buff.byteLength === common.PKG_LENGTHS.V1.OBJ_REG_REQ_PKG) {
      parsedPackage.packageType = buff[this.#i++];
      parsedPackage.packageVersion = buff[this.#i++];
      parsedPackage.mac = this.getMac(buff);
      parsedPackage.rtc = this.getRtc(buff);
      parsedPackage.crc = buff[this.#i];
    }

    return parsedPackage;
  }

  /**
   * Get object activation request (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {types.ObjectActivationRequest} Object activation request.
   */
  getObjectActivationRequestV1(buff) {
    /**
     * Parsed package.
     *
     * @type {types.ObjectActivationRequest}
     */
    let parsedPackage = {
      packageType: 0x00,
      packageVersion: 0x00,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      activationCode: Buffer.from([0x00, 0x00, 0x00, 0x00]),
      crc: 0x00,
    };

    this.#i = 0;

    if (buff.byteLength === common.PKG_LENGTHS.V1.OBJ_ACT_REQ_PKG) {
      parsedPackage.packageType = buff[this.#i++];
      parsedPackage.packageVersion = buff[this.#i++];
      parsedPackage.mac = this.getMac(buff);
      parsedPackage.rtc = this.getRtc(buff);
      parsedPackage.activationCode = Buffer.from([
        buff[this.#i++],
        buff[this.#i++],
        buff[this.#i++],
        buff[this.#i++],
      ]);
      parsedPackage.crc = buff[this.#i];
    }

    return parsedPackage;
  }

  /**
   * Get object settings (v1) values length.
   *
   * @param {Buffer} buff Buffer.
   * @return {number} Values length.
   */
  getObjectSettingsV1ValuesLength(buff) {
    /**
     * Counter.
     *
     * @type {number}
     */
    let i = 8;

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
        case common.STG_TYPES.WASTE_BIN_CAPACITY_LIMIT:
          i += common.STG_LENGTHS.WASTE_BIN_CAPACITY_LIMIT;
          length += common.STG_LENGTHS.WASTE_BIN_CAPACITY_LIMIT;

          break;

        default:
          break;
      }
    }

    return length;
  }

  /**
   * Get object settings (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {types.ObjectSettings} Object settings.
   */
  getObjectSettings(buff) {
    /**
     * Parsed package.
     *
     * @type {types.ObjectSettings}
     */
    let parsedPackage = {
      packageType: 0x00,
      packageVersion: 0x00,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      numberOfValues: 0,
      values: {},
      crc: 0x00,
    };

    this.#i = 0;

    if (buff.byteLength > 0) {
      parsedPackage.packageType = buff[this.#i++];
      parsedPackage.packageVersion = buff[this.#i++];
      parsedPackage.mac = this.getMac(buff);
      parsedPackage.numberOfValues = buff[this.#i++];

      for (let j = 0; j < parsedPackage.numberOfValues; j++) {
        switch (buff[this.#i]) {
          case common.STG_TYPES.WASTE_BIN_CAPACITY_LIMIT:
            this.#i++;

            parsedPackage.values.wasteBinCapacityLimit =
              this.get8BytesBuffer(buff).readDoubleLE(0);

            break;

          default:
            break;
        }
      }

      parsedPackage.crc = buff[this.#i];
    }

    return parsedPackage;
  }

  /**
   * Get object settings (v1) values.
   *
   * @param {Buffer} buff Buffer.
   * @return {Buffer} Buffer.
   */
  getObjectSettingsV1Values(buff) {
    /**
     * Byte array.
     *
     * @type {Array.<Number>}
     */
    let byteArr = [];

    /**
     * Result.
     *
     * @type {Buffer}
     */
    let res = Buffer.from([0x00]);

    this.#i = 8;

    /**
     * Number of values.
     *
     * @type {number}
     */
    let numberOfValues = buff[this.#i++];

    byteArr.push(numberOfValues);

    for (let j = 0; j < numberOfValues; j++) {
      switch (buff[this.#i]) {
        case common.STG_TYPES.WASTE_BIN_CAPACITY_LIMIT:
          byteArr.push(buff[this.#i++]);
          byteArr = byteArr.concat(this.get8BytesByteArr(buff));

          break;

        default:
          break;
      }
    }

    res = Buffer.from(byteArr);

    return res;
  }

  /**
   * Get object settings (v1) values package.
   *
   * @param {Buffer} buff Buffer.
   * @return {types.SettingsValues} Settings values.
   */
  getObjectSettingsV1ValuesPkg(buff) {
    /**
     * Settings values.
     *
     * @type {types.SettingsValues}
     */
    let settingsValues = {
      numberOfValues: 0x00,
      values: {},
    };

    this.#i = 8;

    settingsValues.numberOfValues = buff[this.#i++];

    for (let j = 0; j < settingsValues.numberOfValues; j++) {
      switch (buff[this.#i]) {
        case common.STG_TYPES.WASTE_BIN_CAPACITY_LIMIT:
          this.#i++;

          settingsValues.values.wasteBinCapacityLimit = Buffer.from(
            this.get8BytesBuffer(buff)
          ).readDoubleLE(0);

          break;

        default:
          break;
      }
    }

    return settingsValues;
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

  /**
   * Get object record (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {types.ObjectRecord} Object record.
   */
  getObjectRecordV1(buff) {
    /**
     * Parsed package.
     *
     * @type {types.ObjectRecord}
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

    this.#i = 0;

    if (buff.byteLength > 0) {
      parsedPackage.packageType = buff[this.#i++];
      parsedPackage.packageVersion = buff[this.#i++];
      parsedPackage.mac = this.getMac(buff);
      parsedPackage.rtc = this.getRtc(buff);
      parsedPackage.numberOfValues = buff[this.#i++];

      for (let j = 0; j < parsedPackage.numberOfValues; j++) {
        switch (buff[this.#i]) {
          case common.VAL_TYPES.DISTANCE:
            this.#i++;

            parsedPackage.values.distance =
              this.get8BytesBuffer(buff).readDoubleLE(0);

            break;

          case common.VAL_TYPES.HUMIDITY:
            this.#i++;

            parsedPackage.values.humidity =
              this.get8BytesBuffer(buff).readDoubleLE(0);

            break;

          case common.VAL_TYPES.TEMPERATURE_CELSIUS:
            this.#i++;

            parsedPackage.values.temperatureCelsius =
              this.get8BytesBuffer(buff).readDoubleLE(0);

            break;

          default:
            break;
        }
      }

      parsedPackage.rssi = Buffer.from([
        buff[this.#i++],
        buff[this.#i++],
      ]).readInt16LE(0);
      parsedPackage.crc = buff[this.#i];
    }

    return parsedPackage;
  }
}

module.exports = PackageParser;
