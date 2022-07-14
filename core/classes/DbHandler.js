// @ts-check

const tedious = require('tedious');

// Core - Data
const queries = require('../queries');

/**
 * @typedef DbConfig
 * @type {object}
 * @prop {string} server - Server name
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
 * Class for database handling.
 */
class DbHandler {
  /**
   * Database config data.
   *
   * @type {DbConfig}
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
   * @type {tedious.Connection}
   */
  #conn = new tedious.Connection(this.#config);

  constructor() {
    /**
     * WmObjects.
     *
     * @type {Array.<{Id: Number, Mac: Buffer, Name: String, Latitude: Number, Longitude: Number}>}
     */
    this.wmObjects = [];

    /**
     * SQL query - Select WmObjects.
     *
     * @type {tedious.Request}
     */
    this.sqlSelWmObjects = new tedious.Request(
      queries.SQL_SEL_WM_OBJECTS,
      async (err) => {
        if (err) console.log(err.message);
      }
    );
  }

  /**
   * Execute SQL query.
   *
   * @param {tedious.Request} req Request.
   * @return {void}
   */
  execSql(req) {
    req.removeAllListeners('doneProc');

    switch (req) {
      case this.sqlSelWmObjects:
        this.wmObjects = [];
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

      this.sqlSelWmObjects.on('row', async (columns) => {
        this.wmObjects.push({
          Id: columns[0].value,
          Mac: columns[1].value,
          Name: columns[2].value,
          Latitude: columns[3].value,
          Longitude: columns[4].value,
        });
      });
    });

    this.#conn.connect();
  }
}

module.exports = DbHandler;
