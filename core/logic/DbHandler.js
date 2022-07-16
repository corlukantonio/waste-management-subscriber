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

  constructor() {
    /**
     * Get WmObjects.
     *
     * @return {Array.<typedefs.WmObject>} WmObjects.
     */
    this.getWmObjects = () => this.#wmObjects;
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
            Name: columns[2].value,
            Latitude: columns[3].value,
            Longitude: columns[4].value,
          });
        });

        break;

      case queries.SQL_INS_WM_RECORD:
        req.addParameter('Data', TYPES.VarBinary, args[0], { length: 'max' });
        req.addParameter('WmObjectId', TYPES.Int, args[1]);
        req.addParameter('CreatedAt', TYPES.DateTime2, new Date(Date.now()), {
          length: 7,
        });

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

    this.#conn.on('error', async (err) => {
      if (err) console.log(err.message);
    });

    this.#conn.connect();
  }
}

module.exports = DbHandler;
