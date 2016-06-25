/**
 * Main application file
 */

'use strict';

require('newrelic');

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var throng = require('throng');
var WORKERS = process.env.WEB_CONCURRENCY || 1;

function start() {
  // Connect to database
  mongoose.connect(config.mongo.uri, config.mongo.options);
  // mongoose.set('debug', true);

  // Populate DB with sample data
  if(config.seedDB) { require('./config/seed'); }

  // Setup server
  var app = express();
  var server = require('http').createServer(app);
  require('./config/express')(app);
  require('./routes')(app);
  //require('./BackgroundTask').start();

  // Start server
  server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });

  // Expose app
  //noinspection JSUnresolvedVariable
  exports = module.exports = app;
}

console.log('Server currently using: %d WEB Workers!!!', WORKERS);

throng(start, {
  workers: WORKERS,
  lifetime: Infinity
});
