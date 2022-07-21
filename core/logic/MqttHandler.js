// @ts-check

//#region Imports

import { Client, connect as _connect } from 'mqtt';
import { v4 } from 'uuid';

import { Request } from 'tedious';

// Core - Logic
import DbHandler from './DbHandler';
import LogHandler from './LogHandler';
import PackageParser from './PackageParser';

// Core - Logic - Package validator
import PackageCrcValidator from './package_validator/PackageCrcValidator';
import PackageLengthValidator from './package_validator/PackageLengthValidator';
import PackageTypeValidator from './package_validator/PackageTypeValidator';
import PackageVersionValidator from './package_validator/PackageVersionValidator';

// Core - Data
import common from '../data/common';
import queries from '../data/queries';
import Types from '../data/types';

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
   * @type {Client}
   */
  #client = _connect(this.#url);

  // /**
  //  * MQTT server URL.
  //  *
  //  * @type {string}
  //  */
  // #url = 'mqtt://driver.cloudmqtt.com';

  // /**
  //  * MQTT client.
  //  *
  //  * @type {Client}
  //  */
  // #client = _connect(this.#url, {
  //   clean: true,
  //   port: 18850,
  //   username: 'oxiztsaz',
  //   password: 'fYBafc9Fy6pZ',
  // });

  /**
   * Object registration request.
   *
   * @type {Types["ObjectRegistrationRequest"]}
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
   * @type {Types["ObjectActivationRequest"]}
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
   * @type {Types["ObjectRecord"]}
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

  /**
   * Package type validator.
   *
   * @type {PackageTypeValidator}
   */
  #pkgTypeValidator = new PackageTypeValidator();

  /**
   * Package version validator.
   *
   * @type {PackageVersionValidator}
   */
  #pkgVersionValidator = new PackageVersionValidator();

  /**
   * Package length validator.
   *
   * @type {PackageLengthValidator}
   */
  #pkgLengthValidator = new PackageLengthValidator();

  /**
   * Package CRC validator.
   *
   * @type {PackageCrcValidator}
   */
  #pkgCrcValidator = new PackageCrcValidator();

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
     * @return {Client} MQTT client.
     */
    this.getClient = () => this.#client;

    this.#pkgTypeValidator
      .setNext(this.#pkgVersionValidator)
      .setNext(this.#pkgLengthValidator)
      .setNext(this.#pkgCrcValidator);
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
   * Get set time command.
   *
   * @return {string} Set time command.
   */
  getStCmd() {
    /**
     * Set time command.
     *
     * @type {string}
     */
    let stCmd = '';

    /**
     * Date.
     *
     * @type {Date}
     */
    let date = new Date(Date.now());

    stCmd += 'st ';
    stCmd += date.getUTCFullYear() + ' ';
    stCmd += date.getUTCMonth() + 1 + ' ';
    stCmd += date.getUTCDate() + ' ';
    stCmd += date.getUTCHours() + ' ';
    stCmd += date.getUTCMinutes() + ' ';
    stCmd += date.getUTCSeconds();

    return stCmd;
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
                this.#pkgTypeValidator.setPkgType(
                  common.PKG_TYPES.OBJ_REG_REQ_PKG
                );

                this.#pkgVersionValidator.setPkgVersion(0x01);

                this.#pkgLengthValidator.setPkgLength(
                  common.PKG_LENGTHS.V1.OBJ_REG_REQ_PKG
                );

                this.#pkgCrcValidator.setPkgCrc(msg.slice(-1).readUint8());

                if (this.#pkgTypeValidator.isValid(msg)) {
                  this.#objectRegistrationRequest =
                    PackageParser.getInstance().objectRegistrationRequestV1(
                      msg
                    );

                  /**
                   * Select.
                   *
                   * @type {Request}
                   */
                  let sqlSelWmObjects = new Request(
                    queries.SQL_SEL_WM_OBJECTS,
                    async (err) => {
                      if (err) console.log(err.message);
                    }
                  );

                  /**
                   * Insert.
                   *
                   * @type {Request}
                   */
                  let sqlInsWmObject = new Request(
                    queries.SQL_INS_WM_OBJECT,
                    async (err) => {
                      if (err) console.log(err.message);
                    }
                  );

                  sqlSelWmObjects.on('requestCompleted', async () => {
                    let isObjectDuplicate = false;

                    for (
                      let i = 0;
                      i < DbHandler.getInstance().getWmObjects().length;
                      i++
                    ) {
                      if (
                        DbHandler.getInstance()
                          .getWmObjects()
                          [i].Mac.equals(this.#objectRegistrationRequest.mac)
                      ) {
                        isObjectDuplicate = true;
                      }
                    }

                    if (!isObjectDuplicate) {
                      DbHandler.getInstance().execSql(
                        queries.SQL_INS_WM_OBJECT,
                        sqlInsWmObject,
                        Buffer.from(v4()),
                        this.#objectRegistrationRequest.mac,
                        v4().toString(),
                        this.getGeneratedActivationCode()
                      );
                    } else {
                      console.log(
                        LogHandler.getInstance().getLogMessage(
                          common.LOG_MSG_TYPES.OBJ_DUPLICATE
                        )
                      );
                    }
                  });

                  DbHandler.getInstance().execSql(
                    queries.SQL_SEL_WM_OBJECTS,
                    sqlSelWmObjects
                  );
                }

                break;

              case common.MQTT_TOPICS[1]:
                this.#pkgTypeValidator.setPkgType(
                  common.PKG_TYPES.OBJ_ACT_REQ_PKG
                );

                this.#pkgVersionValidator.setPkgVersion(0x01);

                this.#pkgLengthValidator.setPkgLength(
                  common.PKG_LENGTHS.V1.OBJ_ACT_REQ_PKG
                );

                this.#pkgCrcValidator.setPkgCrc(msg.slice(-1).readUint8());

                if (this.#pkgTypeValidator.isValid(msg)) {
                  this.#objectActivationRequest =
                    PackageParser.getInstance().getObjectActivationRequestV1(
                      msg
                    );

                  /**
                   * Select.
                   *
                   * @type {Request}
                   */
                  let sqlSelWmObjects = new Request(
                    queries.SQL_SEL_WM_OBJECTS,
                    async (err) => {
                      if (err) console.log(err.message);
                    }
                  );

                  /**
                   * Update.
                   *
                   * @type {Request}
                   */
                  let sqlUpdWmObjectIsActivatedById = new Request(
                    queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID,
                    async (err) => {
                      if (err) console.log(err.message);
                    }
                  );

                  sqlSelWmObjects.on('requestCompleted', async () => {
                    for (
                      let i = 0;
                      i < DbHandler.getInstance().getWmObjects().length;
                      i++
                    ) {
                      if (
                        DbHandler.getInstance()
                          .getWmObjects()
                          [i].Mac.equals(this.#objectActivationRequest.mac) &&
                        !DbHandler.getInstance().getWmObjects()[i]
                          .IsActivated &&
                        DbHandler.getInstance()
                          .getWmObjects()
                          [i].ActivationCode.equals(
                            this.#objectActivationRequest.activationCode
                          )
                      ) {
                        DbHandler.getInstance().execSql(
                          queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID,
                          sqlUpdWmObjectIsActivatedById,
                          true,
                          DbHandler.getInstance().getWmObjects()[i].Id
                        );

                        break;
                      }
                    }
                  });

                  DbHandler.getInstance().execSql(
                    queries.SQL_SEL_WM_OBJECTS,
                    sqlSelWmObjects
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
                this.#pkgTypeValidator.setPkgType(
                  common.PKG_TYPES.OBJ_REC_BASE_PKG
                );

                this.#pkgVersionValidator.setPkgVersion(0x01);

                this.#pkgLengthValidator.setPkgLength(
                  common.PKG_LENGTHS.V1.OBJ_REC_BASE_PKG +
                    PackageParser.getInstance().getObjectRecordV1ValuesLength(
                      msg
                    )
                );

                this.#pkgCrcValidator.setPkgCrc(msg.slice(-1).readUint8());

                if (this.#pkgTypeValidator.isValid(msg)) {
                  this.#objectRecord =
                    PackageParser.getInstance().getObjectRecordV1(msg);

                  /**
                   * Select.
                   *
                   * @type {Request}
                   */
                  let sqlSelWmObjects = new Request(
                    queries.SQL_SEL_WM_OBJECTS,
                    async (err) => {
                      if (err) console.log(err.message);
                    }
                  );

                  /**
                   * Insert.
                   *
                   * @type {Request}
                   */
                  let sqlInsWmRecord = new Request(
                    queries.SQL_INS_WM_RECORD,
                    async (err) => {
                      if (err) console.log(err.message);
                    }
                  );

                  sqlSelWmObjects.on('requestCompleted', async () => {
                    for (
                      let i = 0;
                      i < DbHandler.getInstance().getWmObjects().length;
                      i++
                    ) {
                      if (
                        DbHandler.getInstance()
                          .getWmObjects()
                          [i].Mac.equals(this.#objectRecord.mac)
                      ) {
                        if (
                          DbHandler.getInstance().getWmObjects()[i].IsActivated
                        ) {
                          DbHandler.getInstance().execSql(
                            queries.SQL_INS_WM_RECORD,
                            sqlInsWmRecord,
                            msg,
                            DbHandler.getInstance().getWmObjects()[i].Id
                          );

                          this.#client.publish(
                            common.MQTT_TOPICS[6] +
                              this.#objectRecord.mac.toString('hex'),
                            this.getStCmd()
                          );
                        } else {
                          console.log(
                            LogHandler.getInstance().getLogMessage(
                              common.LOG_MSG_TYPES.OBJ_NOT_ACT,
                              DbHandler.getInstance().getWmObjects()[i].Id
                            )
                          );
                        }

                        break;
                      }
                    }
                  });

                  DbHandler.getInstance().execSql(
                    queries.SQL_SEL_WM_OBJECTS,
                    sqlSelWmObjects
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

export default MqttHandler;
