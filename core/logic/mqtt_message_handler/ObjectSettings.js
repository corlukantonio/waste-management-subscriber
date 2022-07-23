// @ts-check

//#region Imports

const { Request } = require('tedious');

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
class ObjectSettings extends MqttMessageHandler {
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
  #sqlUpdWmObjectSettingsById;

  /**
   * Constructor.
   *
   * @param {Buffer} msg Message.
   */
  constructor(msg) {
    super(
      msg,
      common.PKG_TYPES.OBJ_STG_PKG,
      common.PKG_VERSIONS.V1,
      common.PKG_LENGTHS.V1.OBJ_STG_PKG +
        PackageParser.getInstance().getObjectSettingsV1ValuesLength(msg),
      msg.slice(-1).readUint8()
    );

    this.#msg = msg;
  }

  /**
   * Get package.
   *
   * @protected
   * @return {types.ObjectSettings} Package.
   */
  getPackage() {
    return PackageParser.getInstance().getObjectSettings(this.#msg);
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

    this.#sqlUpdWmObjectSettingsById = new Request(
      queries.SQL_UPD_WM_OBJECT_SETTINGS_BY_ID,
      async (err) => {
        if (err) console.log(err.message);
      }
    );
  }

  /**
   * Do main.
   *
   * @param {types.ObjectSettings} pkg Package.
   * @return {void}
   */
  doMain(pkg) {
    this.#sqlSelWmObjects.on('requestCompleted', async () => {
      for (let i = 0; i < DbHandler.getInstance().getWmObjects().length; i++) {
        if (DbHandler.getInstance().getWmObjects()[i].Mac.equals(pkg.mac)) {
          if (DbHandler.getInstance().getWmObjects()[i].IsActivated) {
            DbHandler.getInstance().execSql(
              queries.SQL_UPD_WM_OBJECT_SETTINGS_BY_ID,
              this.#sqlUpdWmObjectSettingsById,
              PackageParser.getInstance().getObjectSettingsV1Values(this.#msg),
              DbHandler.getInstance().getWmObjects()[i].Id
            );

            /**
             * Settings values.
             *
             * @type {types.SettingsValues}
             */
            let settingsValues =
              PackageParser.getInstance().getObjectSettingsV1ValuesPkg(
                this.#msg
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
      this.#sqlSelWmObjects
    );
  }
}

module.exports = ObjectSettings;
