// @ts-check

//#region Imports

const { Request } = require('tedious');

// Core - Logic
const DbHandler = require('../../logic/DbHandler');
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
class ObjectActivationRequest extends MqttMessageHandler {
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
   * Update.
   *
   * @type {Request}
   */
  #sqlUpdWmObjectIsActivatedById;

  /**
   * Constructor.
   *
   * @param {Buffer} msg Message.
   */
  constructor(msg) {
    super(
      msg,
      common.PKG_TYPES.OBJ_ACT_REQ_PKG,
      common.PKG_VERSIONS.V1,
      common.PKG_LENGTHS.V1.OBJ_ACT_REQ_PKG,
      msg.slice(-1).readUint8()
    );

    this.#msg = msg;
  }

  /**
   * Get package.
   *
   * @protected
   * @return {types.ObjectActivationRequest} Package.
   */
  getPackage() {
    return PackageParser.getInstance().getObjectActivationRequestV1(this.#msg);
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

    this.#sqlUpdWmObjectIsActivatedById = new Request(
      queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID,
      async (err) => {
        if (err) console.log(err.message);
      }
    );
  }

  /**
   * Do main.
   *
   * @param {types.ObjectActivationRequest} pkg Package.
   * @return {void}
   */
  doMain(pkg) {
    this.#sqlSelWmObjects.on('requestCompleted', async () => {
      for (let i = 0; i < DbHandler.getInstance().getWmObjects().length; i++) {
        if (
          DbHandler.getInstance().getWmObjects()[i].Mac.equals(pkg.mac) &&
          !DbHandler.getInstance().getWmObjects()[i].IsActivated &&
          DbHandler.getInstance()
            .getWmObjects()
            [i].ActivationCode.equals(pkg.activationCode)
        ) {
          DbHandler.getInstance().execSql(
            queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID,
            this.#sqlUpdWmObjectIsActivatedById,
            true,
            DbHandler.getInstance().getWmObjects()[i].Id
          );

          break;
        }
      }
    });

    DbHandler.getInstance().execSql(
      queries.SQL_SEL_WM_OBJECTS,
      this.#sqlSelWmObjects
    );
  }
}

module.exports = ObjectActivationRequest;
