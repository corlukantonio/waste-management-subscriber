// @ts-check

//#region Imports

// Core - Data
import Types from './types';

//#endregion

/**
 * Common.
 *
 * @type {Types["Common"]}
 */
const common = {
  DB_TABLES: {
    WM_OBJECTS: 'WmObjects',
    WM_RECORDS: 'WmRecords',
  },

  LOG_MSG_TYPES: {
    DB_CONNECTED: 0x01,
    DB_ROW_INSERTED: 0x02,
    DB_ROW_UPDATED: 0x03,
    MQTT_CONNECTED: 0x04,
    ERR_PKG_TYPE: 0x05,
    ERR_PKG_VERSION: 0x06,
    ERR_PKG_LEN: 0x07,
    ERR_PKG_CRC: 0x08,
    OBJ_DUPLICATE: 0x09,
    OBJ_NOT_ACT: 0x0a,
  },

  MQTT_TOPICS: [
    'iot/wm/devreg',
    'iot/wm/devact',
    'iot/wm/reccfg',
    'iot/wm/recapp',
    'iot/wm/record',
    'iot/wm/subscriber',
    'iot/wm/response/',
  ],

  PKG_TYPES: {
    OBJ_REG_REQ_PKG: 0x01,
    OBJ_ACT_REQ_PKG: 0x02,
    OBJ_REC_CFG_REQ_PKG: 0x03,
    OBJ_REC_CFG_APV_REQ_PKG: 0x04,
    OBJ_REC_BASE_PKG: 0x05,
  },

  PKG_VERSIONS: {
    V1: 0x01,
  },

  PKG_LENGTHS: {
    V1: {
      OBJ_REG_REQ_PKG: 15,
      OBJ_ACT_REQ_PKG: 19,
      OBJ_REC_BASE_PKG: 18,
    },
  },

  VAL_TYPES: {
    DISTANCE: 0x01,
    HUMIDITY: 0x02,
    TEMPERATURE_CELSIUS: 0x03,
  },

  VAL_LENGTHS: {
    DISTANCE: 9,
    HUMIDITY: 9,
    TEMPERATURE_CELSIUS: 9,
  },
};

export default common;
