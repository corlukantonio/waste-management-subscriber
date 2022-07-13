// Core - Data
const commonData = require('../commonData');

class PackageParser {
  constructor() {}

  /**
   * Get parsed package.
   *
   * @param {Buffer} buff Buffer.
   */
  getParsedPackage(buff) {
    let parsedPackage = {};

    if (buff.length > 0) {
      switch (buff[0]) {
        case commonData.OBJ_REC_BASE_PKG:
          parsedPackage = {
            packageType: buff[0],
            packageVersion: buff[1],
            mac: Buffer.from([
              buff[2],
              buff[3],
              buff[4],
              buff[5],
              buff[6],
              buff[7],
            ]),
            rtc: [buff[8], buff[9], buff[10], buff[11], buff[12], buff[13]],
            numberOfValues: buff[14],
          };

          for (let i = 15, j = 0; j < parsedPackage.numberOfValues; j++) {
            switch (buff[i]) {
              case 1:
                parsedPackage.distance = Buffer.from([
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                ]).readDoubleLE(0);

                i++;

                break;

              case 2:
                parsedPackage.humidity = Buffer.from([
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                ]).readDoubleLE(0);

                i++;

                break;

              case 3:
                parsedPackage.temperatureCelsius = Buffer.from([
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                  buff[++i],
                ]).readDoubleLE(0);

                i++;

                break;

              default:
                break;
            }
          }

          parsedPackage.rssi = Buffer.from([buff[42], buff[43]]).readInt16LE(0);

          break;

        default:
          break;
      }
    }

    return parsedPackage;
  }
}

module.exports = PackageParser;
