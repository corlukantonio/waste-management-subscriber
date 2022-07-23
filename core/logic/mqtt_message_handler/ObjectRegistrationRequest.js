// @ts-check

//#region Imports

const { Request } = require('tedious');
const uuid = require('uuid');

// Core - Logic
const DbHandler = require('../../logic/DbHandler');
const LogHandler = require('../../logic/LogHandler');
const MqttMessageHandler = require('./MqttMessageHandler');
const PackageParser = require('../../logic/PackageParser');

// Core - Data
const common = require('../../data/common');
const queries = require('../../data/queries');
const types = require('../../data/types');

//#endregion

/**
 * @extends MqttMessageHandler
 */
class ObjectRegistrationRequest extends MqttMessageHandler {
  /**
   * Message.
   *
   * @type {Buffer}
   */
  #msg;

  /**
   * Select.
   *
   * @type {Request}
   */
  #sqlSelWmObjects;

  /**
   * Insert.
   *
   * @type {Request}
   */
  #sqlInsWmObject;

  /**
   * Constructor.
   *
   * @param {Buffer} msg Message.
   */
  constructor(msg) {
    super(
      msg,
      common.PKG_TYPES.OBJ_REG_REQ_PKG,
      common.PKG_VERSIONS.V1,
      common.PKG_LENGTHS.V1.OBJ_REG_REQ_PKG,
      msg.slice(-1).readUint8()
    );

    this.#msg = msg;
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
   * Get package.
   *
   * @protected
   * @return {types.ObjectRegistrationRequest} Package.
   */
  getPackage() {
    return PackageParser.getInstance().objectRegistrationRequestV1(this.#msg);
  }

  /**
   * Set queries.
   *
   * @return {void}
   */
  setQueries() {
    this.#sqlSelWmObjects = new Request(
      queries.SQL_SEL_WM_OBJECTS,
      async (err) => {
        if (err) console.log(err.message);
      }
    );

    this.#sqlInsWmObject = new Request(
      queries.SQL_INS_WM_OBJECT,
      async (err) => {
        if (err) console.log(err.message);
      }
    );
  }

  /**
   * Do main.
   *
   * @param {types.ObjectRegistrationRequest} pkg Package.
   * @return {void}
   */
  doMain(pkg) {
    this.#sqlSelWmObjects.on('requestCompleted', async () => {
      /**
       * Boolean.
       *
       * @type {boolean}
       */
      let isObjectDuplicate = false;

      for (let i = 0; i < DbHandler.getInstance().getWmObjects().length; i++) {
        if (DbHandler.getInstance().getWmObjects()[i].Mac.equals(pkg.mac)) {
          isObjectDuplicate = true;
        }
      }

      if (!isObjectDuplicate) {
        DbHandler.getInstance().execSql(
          queries.SQL_INS_WM_OBJECT,
          this.#sqlInsWmObject,
          Buffer.from(uuid.v4()),
          pkg.mac,
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
      this.#sqlSelWmObjects
    );
  }
}

module.exports = ObjectRegistrationRequest;
