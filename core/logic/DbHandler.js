// @ts-check

//#region Imports

const { Connection, TYPES, Request } = require('tedious');

// Core - Data
const queries = require('../data/queries');
const typedefs = require('../data/typedefs');

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
   * @type {typedefs.DbConfig}
   */
  #config = {
    server: 'waste-management.database.windows.net',
    authentication: {
      type: 'default',
      options: {
        userName: 'acorluka',
        password: '063Hesoyam123321_',
      },
    },
    options: {
      encrypt: true,
      database: 'waste-management-db',
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
   * @type {Array.<typedefs.WmObject>}
   */
  #wmObjects = [];

  /**
   * @private
   */
  constructor() {
    /**
     * Get WmObjects.
     *
     * @return {Array.<typedefs.WmObject>} WmObjects.
     */
    this.getWmObjects = () => this.#wmObjects;
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
   * @param {...*} args Arguments.
   * @return {void}
   */
  execSql(query, req, ...args) {
    switch (query) {
      case queries.SQL_SEL_WM_OBJECTS:
        this.#wmObjects = [];

        req.on('row', async (columns) => {
          this.#wmObjects.push({
            Id: columns[0].value,
            Mac: columns[1].value,
            IsActivated: columns[2].value,
            ActivationCode: columns[3].value,
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
                'Inserted a new WmObject with Id value: ' + column.value
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
                'Inserted a new WmRecord with Id value: ' + column.value
              );
            }
          });
        });

        break;

      case queries.SQL_UPD_WM_OBJECT_IS_ACTIVATED_BY_ID:
        req.addParameter('IsActivated', TYPES.Bit, args[0]);
        req.addParameter('Id', TYPES.Int, args[1]);

        req.on('requestCompleted', async () => {
          console.log('Updated WmObject with Id value: ' + args[1]);
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
        'Connected to the "' + this.#config.options.database + '" SQL database.'
      );
    });

    this.#conn.on('end', async () => {
      console.log('Database connection closed.');
    });

    this.#conn.on('error', async (err) => {
      if (err) console.log(err.message);
    });

    this.#conn.connect();
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
