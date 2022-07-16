// @ts-check

/**
 * @typedef PackageTypes
 * @type {object}
 * @prop {number} OBJ_REG_REQ_PKG - ObjectRegistrationRequestPackage.
 * @prop {number} OBJ_ACT_REQ_PKG - ObjectActivationRequestPackage.
 * @prop {number} OBJ_REC_CFG_REQ_PKG - ObjectRecordConfigRequestPackage.
 * @prop {number} OBJ_REC_CFG_APV_REQ_PKG - ObjectRecordConfigApprovalRequestPackage.
 * @prop {number} OBJ_REC_BASE_PKG - ObjectRecordBasePackage.
 */

/**
 * @typedef ValueTypes
 * @type {object}
 * @prop {number} DISTANCE - Distance.
 * @prop {number} HUMIDITY - Humidity.
 * @prop {number} TEMPERATURE_CELSIUS - Temperature (celsius).
 */

/**
 * @typedef Common
 * @type {object}
 * @prop {Array.<String>} MQTT_TOPICS - MQTT topics.
 * @prop {PackageTypes} PKG_TYPES - Package types.
 * @prop {ValueTypes} VAL_TYPES - Value types.
 */

/**
 * @typedef DbConfig
 * @type {object}
 * @prop {string} server - Server name.
 * @prop {object} authentication - Auth data.
 * @prop {string} authentication.type - Auth type.
 * @prop {object} authentication.options - Auth options.
 * @prop {string} authentication.options.userName - Username.
 * @prop {string} authentication.options.password - Password.
 * @prop {object} options - Options.
 * @prop {boolean} options.encrypt - Encrypt.
 * @prop {string} options.database - Database.
 */

/**
 * @typedef WmObject
 * @type {object}
 * @prop {number} Id - ID.
 * @prop {Buffer} Mac - MAC.
 * @prop {string} Name - Name.
 * @prop {number} Latitude - Latitude.
 * @prop {number} Longitude - Longitude.
 */

/**
 * @typedef ObjectRecord
 * @type {object}
 * @prop {number} packageType - Package type.
 * @prop {number} packageVersion - Package version.
 * @prop {Buffer} mac - MAC.
 * @prop {Array.<Number>} rtc - RTC.
 * @prop {number} numberOfValues - Number of values.
 * @prop {object} values - Values.
 * @prop {number} [values.distance] - Distance (optional).
 * @prop {number} [values.humidity] - Humidity (optional).
 * @prop {number} [values.temperatureCelsius] - Temperature celsius (optional).
 * @prop {number} rssi - RSSI.
 * @prop {number} crc - CRC.
 */

module.exports = null;
