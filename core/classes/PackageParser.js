// @ts-check

// Core - Data
const commonData = require('../commonData');

/**
 * @typedef ObjectRecordBasePackage
 * @type {object}
 * @prop {number} packageType - Package type.
 * @prop {number} packageVersion - Package version.
 * @prop {Buffer} mac - MAC.
 * @prop {Array.<Number>} rtc - RTC.
 * @prop {number} numberOfValues - Number of values.
 * @prop {object} values - Values.
 * @prop {number} [values.distance] - Distance (optional).
 * @prop {number} [values.humidity] - Humidity (optional).
 * @prop {number} [values.temperatureCelsius] - Temperature celsius (optional).
 * @prop {number} rssi - RSSI.
 * @prop {number} crc - CRC.
 */

/**
 * Class for package parsing.
 */
class PackageParser {
  constructor() {}

  /**
   * Get object record base package (v1).
   *
   * @param {Buffer} buff Buffer.
   * @return {ObjectRecordBasePackage}
   */
  getObjectRecordBasePackageV1(buff) {
    /**
     * Parsed package.
     *
     * @type {ObjectRecordBasePackage}
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
          case commonData.VAL_DISTANCE:
            const filterPromise = async (values, fn) => {
              const booleans = await Promise.all(values.map(fn));
              const filtered = values.filter((_, i) => booleans[i]);
              return filtered;
            };

            parsedPackage.values.distance = Buffer.from(
              buff.filter(async (n, index) => {
                if (index >= i && index < i + 8) return n;
              })
            ).readDoubleLE(0);

            i += 8;

            break;

          // case commonData.VAL_HUMIDITY:
          //   i++;

          //   parsedPackage.values.humidity = Buffer.from([
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //   ]).readDoubleLE(0);
          //   break;

          // case commonData.VAL_TEMPERATURE_CELSIUS:
          //   i++;

          //   parsedPackage.values.temperatureCelsius = Buffer.from([
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //     buff[i++],
          //   ]).readDoubleLE(0);
          //   break;

          default:
            break;
        }
      }

      // parsedPackage.rssi = Buffer.from([buff[i++], buff[i++]]).readInt16LE(0);
      // parsedPackage.crc = buff[i];
    }

    return parsedPackage;
  }
}

module.exports = PackageParser;
