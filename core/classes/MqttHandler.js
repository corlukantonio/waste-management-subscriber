// @ts-check

const mqtt = require('mqtt');

// Core - Classes
const DbHandler = require('./DbHandler');
const PackageParser = require('./PackageParser');

// Core - Data
const commonData = require('../commonData');

/**
 * Class for MQTT handling.
 */
class MqttHandler {
  // /**
  //  * URL.
  //  *
  //  * @type {string}
  //  */
  // #url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';

  // /**
  //  * MQTT client.
  //  *
  //  * @type {mqtt.Client}
  //  */
  // #client = mqtt.connect(this.#url);

  /**
   * MQTT server URL.
   *
   * @type {string}
   */
  #url = 'mqtt://driver.cloudmqtt.com';

  /**
   * MQTT client.
   *
   * @type {mqtt.Client}
   */
  #client = mqtt.connect(this.#url, {
    clean: true,
    port: 18850,
    username: 'oxiztsaz',
    password: 'fYBafc9Fy6pZ',
  });

  constructor() {}

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

      this.#client.subscribe(commonData.MQTT_TOPICS, async () => {
        this.#client.on('message', async (topic, msg, pkt) => {
          if (msg.byteLength > 0) {
            switch (topic) {
              case commonData.MQTT_TOPICS[0]:
                if (msg[0] == commonData.OBJ_REG_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case commonData.MQTT_TOPICS[1]:
                if (msg[0] == commonData.OBJ_ACT_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case commonData.MQTT_TOPICS[2]:
                if (msg[0] == commonData.OBJ_REC_CFG_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case commonData.MQTT_TOPICS[3]:
                if (msg[0] == commonData.OBJ_REC_CFG_APV_REQ_PKG) {
                  if (msg[1] == 0x01) {
                  }
                }
                break;

              case commonData.MQTT_TOPICS[4]:
                if (msg[0] == commonData.OBJ_REC_BASE_PKG) {
                  if (msg[1] == 0x01) {
                    dbHandler.execSql(dbHandler.sqlSelWmObjects);

                    dbHandler.sqlSelWmObjects.on('doneProc', async () => {
                      console.log(dbHandler.wmObjects[0].Mac);

                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg).mac
                      );
                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg).rtc
                      );
                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg)
                          .numberOfValues
                      );
                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg).values
                          .distance
                      );
                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg).values
                          .humidity
                      );
                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg).values
                          .temperatureCelsius
                      );
                      console.log(
                        packageParser.getObjectRecordBasePackageV1(msg).rssi
                      );
                    });
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
