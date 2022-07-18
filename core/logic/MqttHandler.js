// @ts-check

//#region Imports

const mqtt = require('mqtt');
const uuid = require('uuid');

const { Request } = require('tedious');

// Core - Logic
const DbHandler = require('./DbHandler');
const PackageParser = require('./PackageParser');

// Core - Data
const common = require('../data/common');
const queries = require('../data/queries');
const typedefs = require('../data/typedefs');
const { query } = require('express');

//#endregion

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

  /**
   * Object registration request.
   *
   * @type {typedefs.ObjectRegistrationRequest}
   */
  #objectRegistrationRequest = {
    packageType: 0x00,
    packageVersion: 0x00,
    mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    crc: 0x00,
  };

  /**
   * Object activation request.
   *
   * @type {typedefs.ObjectActivationRequest}
   */
  #objectActivationRequest = {
    packageType: 0x00,
    packageVersion: 0x00,
    mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    activationCode: Buffer.from([0x00, 0x00, 0x00, 0x00]),
    crc: 0x00,
  };

  /**
   * Object record.
   *
   * @type {typedefs.ObjectRecord}
   */
  #objectRecord = {
    packageType: 0x00,
    packageVersion: 0x00,
    mac: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    rtc: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    numberOfValues: 0,
    values: {},
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
   * Get generated activation code.
   *
   * @return {Buffer} Activation code.
   */
  getGeneratedActivationCode() {
    /**
     * Activation code.
     *
     * @type {Buffer}
     */
    let activationCode = Buffer.from([0x00, 0x00, 0x00, 0x00]);

    /**
     * Activation code array.
     *
     * @type {Array.<Number>}
     */
    let activationCodeArr = [];

    for (let i = 0; i < 4; i++) {
      activationCodeArr[i] = Math.floor(Math.random() * 9)
        .toString()
        .charCodeAt(0);
    }

    activationCode = Buffer.from(activationCodeArr);

    return activationCode;
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
                if (msg[0] === common.PKG_TYPES.OBJ_REG_REQ_PKG) {
                  if (msg[1] === 0x01) {
                    if (
                      msg.byteLength === common.PKG_LENGTHS.V1.OBJ_REG_REQ_PKG
                    ) {
                      let sqlSelWmObjects = new Request(
                        queries.SQL_SEL_WM_OBJECTS,
                        async (err) => {
                          if (err) console.log(err.message);
                        }
                      );

                      let sqlInsWmObject = new Request(
                        queries.SQL_INS_WM_OBJECT,
                        async (err) => {
                          if (err) console.log(err.message);
                        }
                      );

                      sqlSelWmObjects.on('requestCompleted', async () => {
                        let isObjectDuplicate = false;

                        this.#objectRegistrationRequest =
                          packageParser.objectRegistrationRequestV1(msg);

                        for (
                          let i = 0;
                          i < dbHandler.getWmObjects().length;
                          i++
                        ) {
                          if (
                            dbHandler
                              .getWmObjects()
                              [i].Mac.equals(
                                this.#objectRegistrationRequest.mac
                              )
                          ) {
                            isObjectDuplicate = true;
                          }
                        }

                        if (!isObjectDuplicate) {
                          dbHandler.execSql(
                            queries.SQL_INS_WM_OBJECT,
                            sqlInsWmObject,
                            Buffer.from(uuid.v4()),
                            this.#objectRegistrationRequest.mac,
                            uuid.v4().toString(),
                            this.getGeneratedActivationCode()
                          );
                        }
                      });

                      dbHandler.execSql(
                        queries.SQL_SEL_WM_OBJECTS,
                        sqlSelWmObjects
                      );
                    } else {
                      console.log(
                        'Package length error! Expected ' +
                          common.PKG_LENGTHS.V1.OBJ_REG_REQ_PKG +
                          ', got ' +
                          msg.byteLength +
                          '.'
                      );
                    }
                  }
                } else {
                  console.log(
                    'Package type error! Expected ' +
                      common.PKG_TYPES.OBJ_REG_REQ_PKG +
                      ', got ' +
                      msg[0] +
                      '.'
                  );
                }

                break;

              case common.MQTT_TOPICS[1]:
                if (msg[0] === common.PKG_TYPES.OBJ_ACT_REQ_PKG) {
                  if (msg[1] === 0x01) {
                    if (
                      msg.byteLength === common.PKG_LENGTHS.V1.OBJ_ACT_REQ_PKG
                    ) {
                      let sqlSelWmObjects = new Request(
                        queries.SQL_SEL_WM_OBJECTS,
                        async (err) => {
                          if (err) console.log(err.message);
                        }
                      );

                      let sqlUpdWmObjectIsActivatedById = new Request(
                        queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID,
                        async (err) => {
                          if (err) console.log(err.message);
                        }
                      );

                      sqlSelWmObjects.on('requestCompleted', async () => {
                        this.#objectActivationRequest =
                          packageParser.getObjectActivationRequestV1(msg);

                        for (
                          let i = 0;
                          i < dbHandler.getWmObjects().length;
                          i++
                        ) {
                          if (
                            dbHandler
                              .getWmObjects()
                              [i].Mac.equals(
                                this.#objectActivationRequest.mac
                              ) &&
                            !dbHandler.getWmObjects()[i].IsActivated &&
                            dbHandler
                              .getWmObjects()
                              [i].ActivationCode.equals(
                                this.#objectActivationRequest.activationCode
                              )
                          ) {
                            dbHandler.execSql(
                              queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID,
                              sqlUpdWmObjectIsActivatedById,
                              true,
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
                    } else {
                      console.log(
                        'Package length error! Expected ' +
                          common.PKG_LENGTHS.V1.OBJ_ACT_REQ_PKG +
                          ', got ' +
                          msg.byteLength +
                          '.'
                      );
                    }
                  }
                } else {
                  console.log(
                    'Package type error! Expected ' +
                      common.PKG_TYPES.OBJ_ACT_REQ_PKG +
                      ', got ' +
                      msg[0] +
                      '.'
                  );
                }

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
                if (msg[0] === common.PKG_TYPES.OBJ_REC_BASE_PKG) {
                  if (msg[1] === 0x01) {
                    if (
                      msg.byteLength ===
                      common.PKG_LENGTHS.V1.OBJ_REC_BASE_PKG +
                        packageParser.getObjectRecordV1ValuesLength(msg)
                    ) {
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
                        this.#objectRecord =
                          packageParser.getObjectRecordV1(msg);

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
                            if (dbHandler.getWmObjects()[i].IsActivated) {
                              dbHandler.execSql(
                                queries.SQL_INS_WM_RECORD,
                                sqlInsWmRecord,
                                msg,
                                dbHandler.getWmObjects()[i].Id
                              );
                            } else {
                              console.log(
                                'WmObject with Id value ' +
                                  dbHandler.getWmObjects()[i].Id +
                                  ' is not activated.'
                              );
                            }

                            break;
                          }
                        }
                      });

                      dbHandler.execSql(
                        queries.SQL_SEL_WM_OBJECTS,
                        sqlSelWmObjects
                      );
                    } else {
                      console.log(
                        'Package length error! Expected ' +
                          (common.PKG_LENGTHS.V1.OBJ_REC_BASE_PKG +
                            packageParser.getObjectRecordV1ValuesLength(msg)) +
                          ', got ' +
                          msg.byteLength +
                          '.'
                      );
                    }
                  }
                } else {
                  console.log(
                    'Package type error! Expected ' +
                      common.PKG_TYPES.OBJ_REC_BASE_PKG +
                      ', got ' +
                      msg[0] +
                      '.'
                  );
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
