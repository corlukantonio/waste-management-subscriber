// @ts-check

//#region Imports

const mqtt = require('mqtt');

const { Request } = require('tedious');

// Core - Logic
const DbHandler = require('./DbHandler');
const PackageParser = require('./PackageParser');

// Core - Data
const common = require('../data/common');
const queries = require('../data/queries');
const typedefs = require('../data/typedefs');

//#endregion

/**
 * Class for MQTT handling.
 */
class MqttHandler {
  /**
   * URL.
   *
   * @type {string}
   */
  #url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';

  /**
   * MQTT client.
   *
   * @type {mqtt.Client}
   */
  #client = mqtt.connect(this.#url);

  // /**
  //  * MQTT server URL.
  //  *
  //  * @type {string}
  //  */
  // #url = 'mqtt://driver.cloudmqtt.com';

  // /**
  //  * MQTT client.
  //  *
  //  * @type {mqtt.Client}
  //  */
  // #client = mqtt.connect(this.#url, {
  //   clean: true,
  //   port: 18850,
  //   username: 'oxiztsaz',
  //   password: 'fYBafc9Fy6pZ',
  // });

  /**
   * Object record.
   *
   * @type {typedefs.ObjectRecord}
   */
  #objectRecord = {
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

  constructor() {
    /**
     * Get URL.
     *
     * @return {string} URL.
     */
    this.getUrl = () => this.#url;

    /**
     * Get MQTT client.
     *
     * @return {mqtt.Client} MQTT client.
     */
    this.getClient = () => this.#client;
  }

  /**
   * Connect to MQTT server.
   *
   * @param {DbHandler} dbHandler Database handler.
   * @param {PackageParser} packageParser Package parser.
   * @return {void}
   */
  connect(dbHandler, packageParser) {
    this.#client.on('connect', async () => {
      console.log('Connected to the "' + this.#url + '" MQTT broker.');

      this.#client.subscribe(common.MQTT_TOPICS, async () => {
        this.#client.on('message', async (topic, msg) => {
          if (msg.byteLength > 0) {
            switch (topic) {
              case common.MQTT_TOPICS[0]:
                if (msg[0] == common.PKG_TYPES.OBJ_REG_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case common.MQTT_TOPICS[1]:
                if (msg[0] == common.PKG_TYPES.OBJ_ACT_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case common.MQTT_TOPICS[2]:
                if (msg[0] == common.PKG_TYPES.OBJ_REC_CFG_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case common.MQTT_TOPICS[3]:
                if (msg[0] == common.PKG_TYPES.OBJ_REC_CFG_APV_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case common.MQTT_TOPICS[4]:
                if (msg[0] == common.PKG_TYPES.OBJ_REC_BASE_PKG) {
                  if (msg[1] == 0x01) {
                    let sqlSelWmObjects = new Request(
                      queries.SQL_SEL_WM_OBJECTS,
                      async (err) => {
                        if (err) console.log(err.message);
                      }
                    );

                    let sqlInsWmRecord = new Request(
                      queries.SQL_INS_WM_RECORD,
                      async (err) => {
                        if (err) console.log(err.message);
                      }
                    );

                    sqlSelWmObjects.on('requestCompleted', async () => {
                      this.#objectRecord = packageParser.getObjectRecordV1(msg);

                      for (
                        let i = 0;
                        i < dbHandler.getWmObjects().length;
                        i++
                      ) {
                        if (
                          dbHandler
                            .getWmObjects()
                            [i].Mac.equals(this.#objectRecord.mac)
                        ) {
                          dbHandler.execSql(
                            queries.SQL_INS_WM_RECORD,
                            sqlInsWmRecord,
                            msg,
                            dbHandler.getWmObjects()[i].Id
                          );

                          break;
                        }
                      }
                    });

                    dbHandler.execSql(
                      queries.SQL_SEL_WM_OBJECTS,
                      sqlSelWmObjects
                    );
                  }
                }
                break;

              default:
                break;
            }
          }
        });
      });
    });

    this.#client.on('error', async (err) => {
      if (err) console.log(err.message);
    });
  }
}

module.exports = MqttHandler;
