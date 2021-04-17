'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const yaml = require('js-yaml');
const fs   = require('fs');
const pug = require('pug');

// const DynamoStore = require('@shiftcoders/dynamo-easy').DynamoStore
// const venue  = require('./models/venue').venue

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.index = function(event, context, callback) {
  console.log(event); // Contains incoming request data (e.g., query params, headers and more)

  const venues = json.safeLoad(fs.readFileSync('venues.json', 'utf8'))
  // const venues = await scanTable('venue-dev');

  const response = {
    statusCode: 200,
    headers: {
      // 'Content-Type': 'text/html',
      'Content-Type': 'application/json',
    },
    // body: pug.renderFile('./views/index.pug', { venues }),
    body: JSON.stringify(venues),
  };

  callback(null, response);
};

module.exports.viewAll = function(event, context, callback) {
  console.log(event); // Contains incoming request data (e.g., query params, headers and more)

  // const venues = JSON.safeLoad(fs.readFileSync('venues.json', 'utf8'))
  const venues = await scanTable('venues-dev');

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: pug.renderFile('./views/venues.pug', { venues }),
  };

  callback(null, response);
};
