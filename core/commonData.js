const commonData = {
  MQTT_TOPICS: [
    'iot/wm/devreg',
    'iot/wm/devact',
    'iot/wm/reccfg',
    'iot/wm/recapp',
    'iot/wm/record',
  ],

  //#region PackageTypes

  OBJ_REG_REQ_PKG: 0x01,
  OBJ_ACT_REQ_PKG: 0x02,
  OBJ_REC_CFG_REQ_PKG: 0x03,
  OBJ_REC_CFG_APV_REQ_PKG: 0x04,
  OBJ_REC_BASE_PKG: 0x05,

  //#endregion

  //#region ValueTypes

  VAL_DISTANCE: 0x01,
  VAL_HUMIDITY: 0x02,
  VAL_TEMPERATURE_CELSIUS: 0x03,

  //#endregion
};

module.exports = commonData;
