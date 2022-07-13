//#region Imports

const express = require('express');
const router = express.Router();
const mqtt = require('mqtt');
const tedious = require('tedious');
const url = require('url');

// Core - Data
const commonData = require('../core/commonData');
const queries = require('../core/queries');

//#endregion

function query() {
  return new Promise((resolve, reject) => {
    dbConnection.execSql(dbGetWmObjects);
  });
}

var dbConnection = new tedious.Connection({
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
});

var dbGetWmObjects = new tedious.Request(queries.SQL_SEL_WM_OBJECTS, (err) => {
  if (err) console.log(err.message);
});

var wmObjects = [{}];

// const mqttUrl = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
// const client = mqtt.connect(mqttUrl);
const mqttUrl = 'mqtt://driver.cloudmqtt.com';
const mqttClient = mqtt.connect(mqttUrl, {
  clean: true,
  port: 18850,
  username: 'oxiztsaz',
  password: 'fYBafc9Fy6pZ',
});

dbConnection.on('connect', async (err) => {
  if (err) console.log(err.message);

  dbGetWmObjects.on('row', async (col) => {
    let wmObject = {
      Id: col[0].value,
      Mac: col[1].value,
    };

    wmObjects.push(wmObject);
  });

  dbGetWmObjects.on('requestCompleted', (rowCount, more) => {
    console.log(rowCount);
    wmObjects.forEach((element) => {
      console.log(element.Id);
      console.log(element.Mac);
    });
  });
});

mqttClient.on('connect', () => {
  mqttClient.subscribe(commonData.MQTT_TOPICS, () => {
    mqttClient.on('message', (topic, msg, pkt) => {
      if (msg.byteLength > 0) {
        switch (msg.at(0)) {
          case commonData.OBJ_REG_REQ_PKG:
            break;

          case commonData.OBJ_ACT_REQ_PKG:
            break;

          case commonData.OBJ_REC_CFG_REQ_PKG:
            break;

          case commonData.OBJ_REC_CFG_APV_REQ_PKG:
            break;

          case commonData.OBJ_REC_BASE_PKG:
            console.log('hel');
            query();

            break;

          default:
            break;
        }
      }
    });
  });
});

mqttClient.on('error', (err) => {
  if (err) console.log(err.message);
});

/**
 * GET home page.
 */

router.get('/', (req, res, next) => {
  let config = url.parse(mqttUrl);

  config.topic = commonData.MQTT_TOPICS.at(4);

  res.render('index', {
    connected: mqttClient.connected,
    config: config,
  });
});

router.post('/publish', function (req, res) {
  var msg = JSON.stringify({
    date: new Date().toString(),
    msg: req.body.msg,
  });
  mqttClient.publish(topic, msg, function () {
    res.writeHead(204, { Connection: 'keep-alive' });
    res.end();
  });
});

router.get('/stream', function (req, res) {
  // send headers for event-stream connection
  // see spec for more information
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  // Timeout timer, send a comment line every 20 sec
  var timer = setInterval(function () {
    res.write('event: ping' + '\n\n');
  }, 20000);
});

dbConnection.connect();

module.exports = router;
