// @ts-check

//#region Imports

const mqtt = require('mqtt');
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
class ObjectRecord extends MqttMessageHandler {
  /**
   * MQTT client.
   *
   * @type {mqtt.Client}
   */
  #mqttClient;

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
  #sqlInsWmRecord;

  /**
   * Constructor.
   *
   * @param {mqtt.Client} mqttClient MQTT client.
   * @param {Buffer} msg Message.
   */
  constructor(mqttClient, msg) {
    super(
      msg,
      common.PKG_TYPES.OBJ_REC_BASE_PKG,
      common.PKG_VERSIONS.V1,
      common.PKG_LENGTHS.V1.OBJ_REC_BASE_PKG +
        PackageParser.getInstance().getObjectRecordV1ValuesLength(msg),
      msg.slice(-1).readUint8()
    );

    this.#mqttClient = mqttClient;

    this.#msg = msg;
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
   * Get package.
   *
   * @protected
   * @return {types.ObjectRecord} Package.
   */
  getPackage() {
    return PackageParser.getInstance().getObjectRecordV1(this.#msg);
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

    this.#sqlInsWmRecord = new Request(
      queries.SQL_INS_WM_RECORD,
      async (err) => {
        if (err) console.log(err.message);
      }
    );
  }

  /**
   * Do main.
   *
   * @param {types.ObjectRecord} pkg Package.
   * @return {void}
   */
  doMain(pkg) {
    this.#sqlSelWmObjects.on('requestCompleted', async () => {
      for (let i = 0; i < DbHandler.getInstance().getWmObjects().length; i++) {
        if (DbHandler.getInstance().getWmObjects()[i].Mac.equals(pkg.mac)) {
          if (DbHandler.getInstance().getWmObjects()[i].IsActivated) {
            DbHandler.getInstance().execSql(
              queries.SQL_INS_WM_RECORD,
              this.#sqlInsWmRecord,
              this.#msg,
              DbHandler.getInstance().getWmObjects()[i].Id
            );

            this.#mqttClient.publish(
              common.MQTT_TOPICS[6] + pkg.mac.toString('hex'),
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
      this.#sqlSelWmObjects
    );
  }
}

module.exports = ObjectRecord;
