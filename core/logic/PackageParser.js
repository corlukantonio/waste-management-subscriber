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
  constructor() {}

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
      packageType: 0,
      packageVersion: 0,
      mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      numberOfValues: 0,
      values: {
        distance: 0,
        humidity: 0,
        temperatureCelsius: 0,
      },
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
      parsedPackage.packageVersion = buff[i++];
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
}

module.exports = PackageParser;
