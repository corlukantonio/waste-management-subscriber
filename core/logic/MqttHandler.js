// @ts-check

//#region Imports

const mqtt = require('mqtt');

// Core - Logic
const LogHandler = require('../logic/LogHandler');

// Core - Logic - MQTT message handler
const ObjectActivationRequest = require('./mqtt_message_handler/ObjectActivationRequest');
const ObjectRecord = require('./mqtt_message_handler/ObjectRecord');
const ObjectRegistrationRequest = require('./mqtt_message_handler/ObjectRegistrationRequest');

// Core - Data
const common = require('../data/common');
const types = require('../data/types');

//#endregion

/**
 * Class for MQTT handling.
 */
class MqttHandler {
  /**
   * One and only instance of the class.
   *
   * @type {MqttHandler}
   */
  static #instance;

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
   * @private
   */
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
   * Get class instance.
   *
   * @return {MqttHandler} Instance.
   */
  static getInstance() {
    if (!MqttHandler.#instance) {
      MqttHandler.#instance = new MqttHandler();
    }

    return MqttHandler.#instance;
  }

  /**
   * Connect to MQTT server.
   *
   * @return {void}
   */
  connect() {
    this.#client.on('connect', async () => {
      console.log(
        LogHandler.getInstance().getLogMessage(
          common.LOG_MSG_TYPES.MQTT_CONNECTED,
          this.#url
        )
      );

      this.#client.subscribe(common.MQTT_TOPICS.slice(0, 6), async () => {
        this.#client.on('message', async (topic, msg) => {
          if (msg.byteLength > 0) {
            switch (topic) {
              case common.MQTT_TOPICS[0]:
                /**
                 * Object registration request handler.
                 *
                 * @type {ObjectRegistrationRequest}
                 */
                let objectRegistrationRequest = new ObjectRegistrationRequest(
                  msg
                );

                objectRegistrationRequest.handleMessage();

                break;

              case common.MQTT_TOPICS[1]:
                /**
                 * Object activation request.
                 *
                 * @type {ObjectActivationRequest}
                 */
                let objectActivationRequest = new ObjectActivationRequest(msg);

                objectActivationRequest.handleMessage();

                break;

              case common.MQTT_TOPICS[2]:
                if (msg[0] === common.PKG_TYPES.OBJ_REC_CFG_REQ_PKG) {
                  if (msg[1] === 0x01) {
                  }
                }

                break;

              case common.MQTT_TOPICS[3]:
                if (msg[0] === common.PKG_TYPES.OBJ_REC_CFG_APV_REQ_PKG) {
                  if (msg[1] === 0x01) {
                  }
                }

                break;

              case common.MQTT_TOPICS[4]:
                /**
                 * Object record.
                 *
                 * @type {ObjectRecord}
                 */
                let objectRecord = new ObjectRecord(this.#client, msg);

                objectRecord.handleMessage();

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
