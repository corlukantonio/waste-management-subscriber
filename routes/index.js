// @ts-check

//#region Imports

const express = require('express');
const router = express.Router();
const url = require('url');

// Core - Logic
const DbHandler = require('../core/logic/DbHandler');
const MqttHandler = require('../core/logic/MqttHandler');

// Core - Data
const common = require('../core/data/common');
const queries = require('../core/data/queries');

//#endregion

DbHandler.getInstance().connect();
MqttHandler.getInstance().connect();

/**
 * GET home page.
 */

router.get('/', (req, res, next) => {
  let config = url.parse(MqttHandler.getInstance().getUrl());

  config.topic = common.MQTT_TOPICS[6];

  res.render('index', {
    connected: MqttHandler.getInstance().getClient().connected,
    config: config,
  });
});

router.post('/publish', async (req, res) => {
  let msg = JSON.stringify({
    date: new Date().toString(),
    msg: req.body.msg,
  });

  MqttHandler.getInstance()
    .getClient()
    .publish(common.MQTT_TOPICS[6], msg, async () => {
      res.writeHead(204, { Connection: 'keep-alive' });
      res.end();
    });
});

router.get('/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  /**
   * Timeout timer, send a comment line every 20 sec.
   */

  let timer = setInterval(function () {
    res.write('event: ping' + '\n\n');
  }, 20000);

  MqttHandler.getInstance()
    .getClient()
    .on('message', async (topic, msg, pkt) => {
      if (topic == common.MQTT_TOPICS[6]) {
        let json = JSON.parse(msg.toString());
        res.write('data: ' + json.date + ': ' + json.msg + '\n\n');
      }
    });
});

module.exports = router;
