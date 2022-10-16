// @ts-check

//#region Imports

const { Connection, Request, TYPES } = require('tedious');

// Core - Logic
const LogHandler = require('./LogHandler');

// Core - Data
const common = require('../data/common');
const queries = require('../data/queries');
const types = require('../data/types');

//#endregion

/**
 * Class for database handling.
 */
class DbHandler {
  /**
   * One and only instance of the class.
   *
   * @type {DbHandler}
   */
  static #instance;

  /**
   * Database config data.
   *
   * @type {types.DbConfig}
   */
  #config = {
    server: process.env.WMS_DB_HOST,
    authentication: {
      type: 'default',
      options: {
        userName: process.env.WMS_DB_USER,
        password: process.env.WMS_DB_PASSWORD,
      },
    },
    options: {
      trustServerCertificate: true,
      encrypt: true,
      database: process.env.WMS_DB_NAME,
    },
  };

  /**
   * Connection.
   *
   * @type {Connection}
   */
  #conn = new Connection(this.#config);

  /**
   * WmObjects.
   *
   * @type {Array.<types.WmObject>}
   */
  #wmObjects = [];

  /**
   * WmObjects_WasteBinForEmptying.
   *
   * @type {Array.<types.WmObjectWasteBinForEmptying>}
   */
  #wmObjectsWasteBinForEmptying = [];

  /**
   * Execute procedure.
   *
   * @type {Request}
   */
  #sqlExecWmTriggerWasteBinEmptying;

  /**
   * @private
   */
  constructor() {
    /**
     * Get WmObjects.
     *
     * @return {Array.<types.WmObject>} WmObjects.
     */
    this.getWmObjects = () => this.#wmObjects;

    /**
     * Get WmObjects_WasteBinForEmptying.
     *
     * @return {Array.<types.WmObjectWasteBinForEmptying>} WmObjects_WasteBinForEmptying.
     */
    this.getWmObjectsWasteBinForEmptying = () =>
      this.#wmObjectsWasteBinForEmptying;

    this.#sqlExecWmTriggerWasteBinEmptying = new Request(
      queries.SQL_EXEC_WM_TRIGGER_WASTE_BIN_EMPTYING,
      async (err) => {
        if (err) console.log(err.message);
      }
    );
  }

  /**
   * Get class instance.
   *
   * @return {DbHandler} Instance.
   */
  static getInstance() {
    if (!DbHandler.#instance) {
      DbHandler.#instance = new DbHandler();
    }

    return DbHandler.#instance;
  }

  /**
   * Execute request.
   *
   * @param {string} query SQL query.
   * @param {Request} req Request.
   * @param {...(Buffer | boolean | number | string)} args Arguments.
   * @return {void}
   */
  execSql(query, req, ...args) {
    switch (query) {
      case queries.SQL_EXEC_WM_TRIGGER_WASTE_BIN_EMPTYING:
        req.on('row', async (columns) => {
          console.log('Return value of the procedure: ' + columns[0].value);
        });

        break;

      case queries.SQL_SEL_WM_OBJECTS:
        this.#wmObjects = [];

        req.on('row', async (columns) => {
          this.#wmObjects.push({
            Id: columns[0].value,
            Mac: columns[1].value,
            IsActivated: columns[2].value,
            ActivationCode: columns[3].value,
            Settings: columns[4].value,
          });
        });

        break;

      case queries.SQL_SEL_WM_OBJECTS_WASTE_BIN_FOR_EMPTYING:
        this.#wmObjectsWasteBinForEmptying = [];

        req.on('row', async (columns) => {
          this.#wmObjectsWasteBinForEmptying.push({
            Id: columns[0].value,
            WmObjectId: columns[1].value,
          });
        });

        break;

      case queries.SQL_INS_WM_OBJECT:
        req.addParameter('Guid', TYPES.Binary, args[0], { length: 36 });
        req.addParameter('Mac', TYPES.Binary, args[1], { length: 6 });
        req.addParameter('Name', TYPES.VarChar, args[2], { length: 50 });
        req.addParameter('ActivationCode', TYPES.Binary, args[3], {
          length: 4,
        });
        req.addParameter('WmGroupId', TYPES.Int, 1);

        req.on('row', async (columns) => {
          columns.forEach(async (column) => {
            if (column.value === null) {
              console.log('NULL');
            } else {
              console.log(
                LogHandler.getInstance().getLogMessage(
                  common.LOG_MSG_TYPES.DB_ROW_INSERTED,
                  common.DB_TABLES.WM_OBJECTS,
                  column.value
                )
              );
            }
          });
        });

        break;

      case queries.SQL_INS_WM_OBJECT_WASTE_BIN_FOR_EMPTYING:
        req.addParameter('WmObjectId', TYPES.Int, args[0]);

        req.on('row', async (columns) => {
          columns.forEach(async (column) => {
            if (column.value === null) {
              console.log('NULL');
            } else {
              console.log(
                LogHandler.getInstance().getLogMessage(
                  common.LOG_MSG_TYPES.DB_ROW_INSERTED,
                  common.DB_TABLES.WM_OBJECTS_WASTE_BIN_FOR_EMPTYING,
                  column.value
                )
              );
            }
          });
        });

        break;

      case queries.SQL_INS_WM_RECORD:
        req.addParameter('Data', TYPES.VarBinary, args[0], { length: 'max' });
        req.addParameter('WmObjectId', TYPES.Int, args[1]);

        req.on('row', async (columns) => {
          columns.forEach(async (column) => {
            if (column.value === null) {
              console.log('NULL');
            } else {
              console.log(
                LogHandler.getInstance().getLogMessage(
                  common.LOG_MSG_TYPES.DB_ROW_INSERTED,
                  common.DB_TABLES.WM_RECORDS,
                  column.value
                )
              );
            }
          });
        });

        break;

      case queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID:
        req.addParameter('IsActivated', TYPES.Bit, args[0]);
        req.addParameter('Id', TYPES.Int, args[1]);

        req.on('requestCompleted', async () => {
          console.log(
            LogHandler.getInstance().getLogMessage(
              common.LOG_MSG_TYPES.DB_ROW_UPDATED,
              common.DB_TABLES.WM_RECORDS,
              args[1]
            )
          );
        });

        break;

      case queries.SQL_UPD_WM_OBJECT_SETTINGS_BY_ID:
        req.addParameter('Settings', TYPES.VarBinary, args[0], {
          length: 'max',
        });
        req.addParameter('Id', TYPES.Int, args[1]);

        req.on('requestCompleted', async () => {
          console.log(
            LogHandler.getInstance().getLogMessage(
              common.LOG_MSG_TYPES.DB_ROW_UPDATED,
              common.DB_TABLES.WM_OBJECTS,
              args[1]
            )
          );
        });

        break;

      default:
        break;
    }

    this.#conn.execSql(req);
  }

  /**
   * Connect to database.
   *
   * @return {void}
   */
  connect() {
    this.#conn.on('connect', async (err) => {
      if (err) console.log(err.message);

      console.log(
        LogHandler.getInstance().getLogMessage(
          common.LOG_MSG_TYPES.DB_CONNECTED,
          this.#config.options.database
        )
      );
    });

    this.#conn.on('end', async () => {
      console.log('Database connection closed.');
    });

    this.#conn.on('error', async (err) => {
      if (err) console.log(err.message);
    });

    this.#conn.connect();

    /**
     * Triggering Power Apps.
     */

    setInterval(async () => {
      this.#sqlExecWmTriggerWasteBinEmptying = new Request(
        queries.SQL_EXEC_WM_TRIGGER_WASTE_BIN_EMPTYING,
        async (err) => {
          if (err) console.log(err.message);
        }
      );

      this.execSql(
        queries.SQL_EXEC_WM_TRIGGER_WASTE_BIN_EMPTYING,
        this.#sqlExecWmTriggerWasteBinEmptying
      );
    }, 3600000);
  }

  /**
   * Close connection.
   *
   * @return {void}
   */
  closeConn() {
    this.#conn.close();
  }
}

module.exports = DbHandler;
