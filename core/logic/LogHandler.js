// @ts-check

//#region Imports

// Core - Data
const common = require('../data/common');

//#endregion

/**
 * Class for log handling.
 */
class LogHandler {
  /**
   * One and only instance of the class.
   *
   * @type {LogHandler}
   */
  static #instance;

  /**
   * @private
   */
  constructor() {}

  /**
   * Get class instance.
   *
   * @return {LogHandler} Instance.
   */
  static getInstance() {
    if (!LogHandler.#instance) {
      LogHandler.#instance = new LogHandler();
    }

    return LogHandler.#instance;
  }

  /**
   * Get log message.
   *
   * @param {number} type Log message type.
   * @param {...*} args Arguments.
   * @return {string} Log.
   */
  getLogMessage(type, ...args) {
    /**
     * Log message.
     *
     * @type {string}
     */
    let logMessage = '';

    switch (type) {
      case common.LOG_MSG_TYPES.DB_CONNECTED:
        logMessage += 'Connected to the "' + args[0] + '" SQL database.';

        break;

      case common.LOG_MSG_TYPES.DB_ROW_INSERTED:
        logMessage +=
          'Inserted a new row in table ' +
          args[0] +
          ' with Id value: ' +
          args[1];

        break;

      case common.LOG_MSG_TYPES.DB_ROW_UPDATED:
        logMessage +=
          'Updated row in table ' + args[0] + ' with Id value: ' + args[1];

        break;

      case common.LOG_MSG_TYPES.MQTT_CONNECTED:
        logMessage += 'Connected to the "' + args[0] + '" MQTT broker.';
        break;

      case common.LOG_MSG_TYPES.ERR_PKG_LEN:
        logMessage +=
          'Package length error! Expected ' +
          args[0] +
          ', got ' +
          args[1] +
          '.';

        break;

      case common.LOG_MSG_TYPES.ERR_PKG_TYPE:
        'Package type error! Expected ' + args[0] + ', got ' + args[1] + '.';

        break;

      case common.LOG_MSG_TYPES.ERR_PKG_CRC:
        logMessage += 'Package CRC error!';

        break;

      case common.LOG_MSG_TYPES.OBJ_DUPLICATE:
        logMessage += 'Object is a duplicate.';

        break;

      case common.LOG_MSG_TYPES.OBJ_NOT_ACT:
        logMessage +=
          'WmObject with Id value: ' + args[0] + ' is not activated.';

        break;

      default:
        break;
    }

    return logMessage;
  }
}

module.exports = LogHandler;
