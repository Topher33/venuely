'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const yaml = require('js-yaml');
const fs   = require('fs');
const pug = require('pug');

// const DynamoStore = require('@shiftcoders/dynamo-easy').DynamoStore
// const venue  = require('./models/venues').Venue

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  console.log(event);
  const requestBody = JSON.parse(event.body);
  const name = requestBody.name;
  const category = requestBody.category;
  const description = requestBody.description;

  if (event.headers['content-type'] !== 'application/json') {
    console.error('Unsupported Media Type');
    callback(null, {
      statusCode: 415,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Could not create venue because of unsupported media type.`
      })
    });
    return;
  }

  if (typeof name !== 'string' || typeof description !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Could not create venue because of validation errors.'));
    return;
  }

  createVenueP(venueInfo(
      name=requestBody.name,
      description=requestBody.description,
      createdAt=new Date().getTime()
    )
  )
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully created venue`,
          venueId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to create venue`
        })
      })
    });
};

module.exports.update = (event, context, callback) => {
  console.log(event);
  const requestBody = JSON.parse(event.body);
  const venueId = event.pathParameters.id;

  if (typeof name !== 'string' || typeof category !== 'string' || typeof description !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t create venue because of validation errors.'));
    return;
  }

  if (event.headers["content-type"] !== 'application/json') {
    console.error('Unsupported Media Type');
    callback(null, {
      statusCode: 415,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Could not create venue because of validation errors.',
      })
    });
    return;
  }

  createVenueP(venueInfo(
      name=requestBody.name,
      description=requestBody.description,
      address=requestBody.address,
      amenties_type=requestBody.amenties_type,
    )
  )
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully created venue`,
          venueId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to create venue`
        })
      })
    });
};

module.exports.viewVenue = (event, context, callback) => {
  const venueId = event.pathParameters.id;
  getVenueP(venueId)
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        // body: pug.renderFile('./views/viewVenue.pug', { venue }),
        body: JSON.stringify(venue),
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 404,
        body: JSON.stringify({
          message: `Unable to find venue, ${ venueId } does not exist`
        })
      })
    });
};

const createVenueP = (name: string) => {
  console.log(`Creating venue: ${name}`);
  const params = {
    TableName: "to-do-list",
    Item: {
      id: uuid(),
      name
    }
  };
  const data = await dynamoDB.put(params).promise()
  return data;
};

const getVenueP = (id: string) => {
  console.log(`Retrieving venue: ${id}`);
  const params = {
    TableName: process.env.VENUE_TABLE,
    Key: {
      id
    }
  };
  dynamoDB.get(params).then (response) ->
    console.log 'getVenue success', response
  .catch (error) ->
    console.error 'getVenue failed', error
  return response.Item;
};

const scanTable = async (tableName) => {
  const params = {
      TableName: tableName,
  };

  let lastEvaluatedKey = 'dummy'; // string must not be empty
  const allItems = [];
  while (lastEvaluatedKey) {
    const data = await dynamoDB.scan(params).promise();
    allItems.push(data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  }
  return allItems;
};

// async function scanTable(tableName) => {
//     const params = {
//         TableName: tableName,
//     };
//     let promise = dynamoDB.scan(params).promise();
//     let result = await promise;
//     let data = result.Items;
//     if (result.LastEvaluatedKey) {
//         params.ExclusiveStartKey = result.LastEvaluatedKey;
//         data = data.concat(await dbRead(params));
//     }
//     return data;
// }

const venueInfo = (
    name,
    description=null,
    address=null
  ) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    name: name,
    description: description,
    address: address,
  };
};
