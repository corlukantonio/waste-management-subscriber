// @ts-check

//#region Imports

const express = require('express');
const router = express.Router();
const url = require('url');

// Core - Logic
const DbHandler = require('../core/logic/DbHandler');
const MqttHandler = require('../core/logic/MqttHandler');
const PackageParser = require('../core/logic/PackageParser');

// Core - Data
const common = require('../core/data/common');

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
  let config = url.parse(mqttHandler.getUrl());

  config.topic = common.MQTT_TOPICS[5];

  res.render('index', {
    connected: mqttHandler.getClient().connected,
    config: config,
  });
});

router.post('/publish', function (req, res) {
  let msg = JSON.stringify({
    date: new Date().toString(),
    msg: req.body.msg,
  });

  mqttHandler.getClient().publish(common.MQTT_TOPICS[5], msg, function () {
    res.writeHead(204, { Connection: 'keep-alive' });
    res.end();
  });
});

router.get('/stream', function (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  // Timeout timer, send a comment line every 20 sec
  let timer = setInterval(function () {
    res.write('event: ping' + '\n\n');
  }, 20000);

  mqttHandler.getClient().subscribe(common.MQTT_TOPICS[5], async () => {
    mqttHandler.getClient().on('message', function (topic, msg, pkt) {
      var json = JSON.parse(msg);
      res.write('data: ' + json.date + ': ' + json.msg + '\n\n');
    });
  });
});

module.exports = router;
