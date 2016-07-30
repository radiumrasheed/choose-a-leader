'use strict';

var Contestant = require('./contestants.model');

var redis = require('redis'),
  config = require('../../config/environment'),
  redisClient = redis.createClient(config.redis.uri);

exports.getContestants = function (req, res) {
  const CACHE_KEY = "CONTESTANTS";
  
  redisClient.exists(CACHE_KEY, function (err, response) {
    if (err) { return doDefault(); }
    else {
      if (response == 1) {
        redisClient.get(CACHE_KEY, function (err, contestants) {
          return res.json(JSON.parse(contestants));
        });
      } else {
        return doDefault();
      }
    }
  });
  
  function doDefault() {
    Contestant.find({}).sort('fullname').exec(function (err,contestants) {
      redisClient.set(CACHE_KEY, JSON.stringify(contestants), function () {
        return res.json(contestants);
      });
    });
  }
};

