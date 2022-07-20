// @ts-check

/**
 * @typedef DbTables
 * @type {object}
 * @prop {string} WM_OBJECTS - WmObjects.
 * @prop {string} WM_RECORDS - WmRecords.
 */

/**
 * @typedef LogMessageTypes
 * @type {object}
 * @prop {number} DB_CONNECTED - Database connected.
 * @prop {number} DB_ROW_INSERTED - Database row inserted.
 * @prop {number} DB_ROW_UPDATED - Database row updated.
 * @prop {number} MQTT_CONNECTED - MQTT connected.
 * @prop {number} ERR_PKG_LEN - Error package length.
 * @prop {number} ERR_PKG_TYPE - Error package type.
 * @prop {number} ERR_PKG_CRC - Error package CRC.
 * @prop {number} OBJ_DUPLICATE - Object duplicate.
 * @prop {number} OBJ_NOT_ACT - Object not activated.
 */

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
 * @typedef PackageLengths
 * @type {object}
 * @prop {object} V1 - Version 1.
 * @prop {number} V1.OBJ_REG_REQ_PKG - ObjectRegistrationRequestPackage.
 * @prop {number} V1.OBJ_ACT_REQ_PKG - ObjectActivationRequestPackage.
 * @prop {number} V1.OBJ_REC_BASE_PKG - ObjectRecordBasePackage.
 */

/**
 * @typedef ValueTypes
 * @type {object}
 * @prop {number} DISTANCE - Distance.
 * @prop {number} HUMIDITY - Humidity.
 * @prop {number} TEMPERATURE_CELSIUS - Temperature (celsius).
 */

/**
 * @typedef ValueLengths
 * @type {object}
 * @prop {number} DISTANCE - Distance.
 * @prop {number} HUMIDITY - Humidity.
 * @prop {number} TEMPERATURE_CELSIUS - Temperature (celsius).
 */

/**
 * @typedef Common
 * @type {object}
 * @prop {DbTables} DB_TABLES - Database tables.
 * @prop {LogMessageTypes} LOG_MSG_TYPES - Log message types.
 * @prop {Array.<String>} MQTT_TOPICS - MQTT topics.
 * @prop {PackageTypes} PKG_TYPES - Package types.
 * @prop {PackageLengths} PKG_LENGTHS - Package lengths.
 * @prop {ValueTypes} VAL_TYPES - Value types.
 * @prop {ValueLengths} VAL_LENGTHS - Value lengths.
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
 * @prop {boolean} IsActivated - Is activated.
 * @prop {Buffer} ActivationCode - Activation code.
 */

/**
 * @typedef ObjectRegistrationRequest
 * @type {object}
 * @prop {number} packageType - Package type.
 * @prop {number} packageVersion - Package version.
 * @prop {Buffer} mac - MAC.
 * @prop {Array.<Number>} rtc - RTC.
 * @prop {number} crc - CRC.
 */

/**
 * @typedef ObjectActivationRequest
 * @type {object}
 * @prop {number} packageType - Package type.
 * @prop {number} packageVersion - Package version.
 * @prop {Buffer} mac - MAC.
 * @prop {Array.<Number>} rtc - RTC.
 * @prop {Buffer} activationCode - Activation code.
 * @prop {number} crc - CRC.
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
