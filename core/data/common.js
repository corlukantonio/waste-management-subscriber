// @ts-check

//#region Imports

// Core - Data
const typedefs = require('./typedefs');

//#endregion

/**
 * Common.
 *
 * @type {typedefs.Common}
 */
const common = {
  MQTT_TOPICS: [
    'iot/wm/devreg',
    'iot/wm/devact',
    'iot/wm/reccfg',
    'iot/wm/recapp',
    'iot/wm/record',
    'iot/wm/subscriber',
  ],

  PKG_TYPES: {
    OBJ_REG_REQ_PKG: 0x01,
    OBJ_ACT_REQ_PKG: 0x02,
    OBJ_REC_CFG_REQ_PKG: 0x03,
    OBJ_REC_CFG_APV_REQ_PKG: 0x04,
    OBJ_REC_BASE_PKG: 0x05,
  },

  VAL_TYPES: {
    DISTANCE: 0x01,
    HUMIDITY: 0x02,
    TEMPERATURE_CELSIUS: 0x03,
  },
};

module.exports = common;
