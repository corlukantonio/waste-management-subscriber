//#region Imports

const express = require('express');
const router = express.Router();
const url = require('url');

// Core - Classes
const DbHandler = require('../core/classes/DbHandler');
const MqttHandler = require('../core/classes/MqttHandler');
const PackageParser = require('../core/classes/PackageParser');

// Core - Data
const commonData = require('../core/commonData');

//#endregion

// Class instances
const dbHandler = new DbHandler();
const mqttHandler = new MqttHandler();
const packageParser = new PackageParser();

dbHandler.connect();
mqttHandler.connect(dbHandler, packageParser);

/**
 * GET home page.
 */

router.get('/', (req, res, next) => {
  let config = url.parse(mqttHandler.mqttUrl);

  config.topic = commonData.MQTT_TOPICS[4];

  res.render('index', {
    connected: mqttHandler.mqttClient.connected,
    config: config,
  });
});

router.post('/publish', function (req, res) {
  var msg = JSON.stringify({
    date: new Date().toString(),
    msg: req.body.msg,
  });

  mqttHandler.mqttClient.publish(commonData.MQTT_TOPICS[4], msg, function () {
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

module.exports = router;
