// @ts-check

//#region Imports

const mqtt = require('mqtt');
const uuid = require('uuid');

const { Request } = require('tedious');

// Core - Logic
const DbHandler = require('./DbHandler');
const LogHandler = require('./LogHandler');
const MqttMessageHandler = require('./MqttMessageHandler');
const PackageParser = require('./PackageParser');

// Core - Data
const common = require('../data/common');
const queries = require('../data/queries');
const typedefs = require('../data/typedefs');

//#endregion

/**
 * The default chaining behavior can be implemented inside a base handler class.
 *
 * @abstract
 * @implements {MqttMessageHandler}
 */
class AbstractMqttMessageHandler {
  /**
   * Next handler.
   *
   * @type {MqttMessageHandler}
   */
  #nextHandler;

  /**
   * Set next.
   *
   * @param {MqttMessageHandler} handler Handler.
   * @return {MqttMessageHandler} MQTT message handler.
   */
  setNext(handler) {
    this.#nextHandler = handler;

    return this.#nextHandler;
  }

  /**
   * Handle.
   *
   * @param {Buffer} msg Message.
   * @return {boolean} True or false.
   */
  handle(msg) {
    if (this.#nextHandler) {
      return this.#nextHandler.handle(msg);
    }

    return true;
  }
}

/**
 * Package type handler.
 *
 * @extends AbstractMqttMessageHandler
 */
class PackageTypeHandler extends AbstractMqttMessageHandler {
  /**
   * Package type.
   *
   * @type {number}
   */
  #packageType;

  constructor() {
    super();

    /**
     * Set package type.
     *
     * @param {number} packageType Package type.
     */
    this.setPackageType = (packageType) => {
      this.#packageType = packageType;
    };
  }

  /**
   * Handle.
   *
   * @param {Buffer} msg Message.
   * @return {boolean} True or false.
   */
  handle(msg) {
    if (msg[0] === this.#packageType) {
      return super.handle(msg);
    }

    console.log(
      LogHandler.getInstance().getLogMessage(
        common.LOG_MSG_TYPES.ERR_PKG_TYPE,
        this.#packageType,
        msg[0]
      )
    );

    return false;
  }
}

/**
 * Package version handler.
 *
 * @extends AbstractMqttMessageHandler
 */
class PackageVersionHandler extends AbstractMqttMessageHandler {
  /**
   * Package version.
   *
   * @type {number}
   */
  #packageVersion;

  constructor() {
    super();

    /**
     * Set package version.
     *
     * @param {number} packageVersion Package version
     */
    this.setPackageVersion = (packageVersion) => {
      this.#packageVersion = packageVersion;
    };
  }

  /**
   * Handle.
   *
   * @param {Buffer} msg Message.
   * @return {boolean} True or false.
   */
  handle(msg) {
    if (msg[1] === this.#packageVersion) {
      return super.handle(msg);
    }

    return false;
  }
}

/**
 * Package length handler.
 *
 * @extends AbstractMqttMessageHandler
 */
class PackageLengthHandler extends AbstractMqttMessageHandler {
  /**
   * Package length.
   *
   * @type {number}
   */
  #packageLength;

  constructor() {
    super();

    /**
     * Set package length.
     *
     * @param {number} packageLength Package length.
     */
    this.setPackageLength = (packageLength) => {
      this.#packageLength = packageLength;
    };
  }

  /**
   * Handle.
   *
   * @param {Buffer} msg Message.
   * @return {boolean} True or false.
   */
  handle(msg) {
    if (msg.byteLength === this.#packageLength) {
      return super.handle(msg);
    }

    console.log(
      LogHandler.getInstance().getLogMessage(
        common.LOG_MSG_TYPES.ERR_PKG_LEN,
        this.#packageLength,
        msg.byteLength
      )
    );

    return false;
  }
}

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

  /**
   * Package type handler.
   *
   * @type {PackageTypeHandler}
   */
  #pkgTypeHandler = new PackageTypeHandler();

  /**
   * Package version handler.
   *
   * @type {PackageVersionHandler}
   */
  #pkgVersionHandler = new PackageVersionHandler();

  /**
   * Package length handler.
   *
   * @type {PackageLengthHandler}
   */
  #pkgLengthHandler = new PackageLengthHandler();

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

    this.#pkgTypeHandler
      .setNext(this.#pkgVersionHandler)
      .setNext(this.#pkgLengthHandler);
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
                this.#pkgTypeHandler.setPackageType(
                  common.PKG_TYPES.OBJ_REG_REQ_PKG
                );

                this.#pkgVersionHandler.setPackageVersion(0x01);

                this.#pkgLengthHandler.setPackageLength(
                  common.PKG_LENGTHS.V1.OBJ_REG_REQ_PKG
                );

                if (this.#pkgTypeHandler.handle(msg)) {
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

                    this.#objectRegistrationRequest =
                      PackageParser.getInstance().objectRegistrationRequestV1(
                        msg
                      );

                    if (
                      !PackageParser.getInstance().checkCrc(
                        this.#objectRegistrationRequest,
                        msg
                      )
                    ) {
                      console.log(
                        LogHandler.getInstance().getLogMessage(
                          common.LOG_MSG_TYPES.ERR_PKG_CRC
                        )
                      );

                      return;
                    }

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
                        Buffer.from(uuid.v4()),
                        this.#objectRegistrationRequest.mac,
                        uuid.v4().toString(),
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
                this.#pkgTypeHandler.setPackageType(
                  common.PKG_TYPES.OBJ_ACT_REQ_PKG
                );

                this.#pkgVersionHandler.setPackageVersion(0x01);

                this.#pkgLengthHandler.setPackageLength(
                  common.PKG_LENGTHS.V1.OBJ_ACT_REQ_PKG
                );

                if (this.#pkgTypeHandler.handle(msg)) {
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
                    this.#objectActivationRequest =
                      PackageParser.getInstance().getObjectActivationRequestV1(
                        msg
                      );

                    if (
                      !PackageParser.getInstance().checkCrc(
                        this.#objectActivationRequest,
                        msg
                      )
                    ) {
                      console.log(
                        LogHandler.getInstance().getLogMessage(
                          common.LOG_MSG_TYPES.ERR_PKG_CRC
                        )
                      );

                      return;
                    }

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
                this.#pkgTypeHandler.setPackageType(
                  common.PKG_TYPES.OBJ_REC_BASE_PKG
                );

                this.#pkgVersionHandler.setPackageVersion(0x01);

                this.#pkgLengthHandler.setPackageLength(
                  common.PKG_LENGTHS.V1.OBJ_REC_BASE_PKG +
                    PackageParser.getInstance().getObjectRecordV1ValuesLength(
                      msg
                    )
                );

                if (this.#pkgTypeHandler.handle(msg)) {
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
                    this.#objectRecord =
                      PackageParser.getInstance().getObjectRecordV1(msg);

                    if (
                      !PackageParser.getInstance().checkCrc(
                        this.#objectRecord,
                        msg
                      )
                    ) {
                      console.log(
                        LogHandler.getInstance().getLogMessage(
                          common.LOG_MSG_TYPES.ERR_PKG_CRC
                        )
                      );

                      return;
                    }

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

module.exports = MqttHandler;
