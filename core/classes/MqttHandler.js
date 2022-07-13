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
  // #url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';

  // #client = mqtt.connect(mqttUrl);

  #url = 'mqtt://driver.cloudmqtt.com';

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
                }
                break;

              case commonData.MQTT_TOPICS[1]:
                if (msg[0] == commonData.OBJ_ACT_REQ_PKG) {
                }
                break;

              case commonData.MQTT_TOPICS[2]:
                if (msg[0] == commonData.OBJ_REC_CFG_REQ_PKG) {
                }
                break;

              case commonData.MQTT_TOPICS[3]:
                if (msg[0] == commonData.OBJ_REC_CFG_APV_REQ_PKG) {
                }
                break;

              case commonData.MQTT_TOPICS[4]:
                if (msg[0] == commonData.OBJ_REC_BASE_PKG) {
                  dbHandler.execSql(dbHandler.sqlSelWmObjects);

                  dbHandler.sqlSelWmObjects.on('doneProc', () => {
                    console.log(dbHandler.wmObjects[0].Mac);

                    console.log(packageParser.getParsedPackage(msg).distance);
                    console.log(packageParser.getParsedPackage(msg).humidity);
                    console.log(
                      packageParser.getParsedPackage(msg).temperatureCelsius
                    );
                    console.log(packageParser.getParsedPackage(msg).rssi);
                  });
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
