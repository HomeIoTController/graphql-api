'use strict'

const express = require('express')
const bodyParser = require('body-parser-graphql')
const { graphqlExpress } = require('apollo-server-express')
const schema = require('./src/schema')
const jwt = require('express-jwt')
const cors = require('cors')
const huejay = require('huejay')
const kafka = require('kafka-node')

require('dotenv').config() 

const API_PORT = process.env.API_PORT ? process.env.API_PORT : 3000

// create our express app
const app = express()
app.use(cors())

function setupServer(client) {
  // auth middleware
  const auth = jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false
  })

  const kafkaServer = process.env.KAFKA_SERVER ? process.env.KAFKA_SERVER : 'kafka_server';
  const kafkaPort = process.env.KAFKA_PORT ? process.env.KAFKA_PORT : '9092';
  const kafkaClient = new kafka.KafkaClient({
    kafkaHost: `${kafkaServer}:${kafkaPort}`
  });
  const kafkaProducer = new kafka.Producer(kafkaClient);

  if (process.env.KAFKA_DEBUG) {
    createKafkaConsumer(kafkaClient);
  }

  kafkaProducer.on('ready', () => {
    console.log("Kafka producer is connected!");

    // graphql endpoint
    app.use(
      '/graphql',
      bodyParser.graphql(),
      auth,
      graphqlExpress(req => ({
        schema,
        context: {
          user: req.user,
          kafkaProducer,
          philipsHueClient: client
        }
      }))
    )

    app.listen(API_PORT, () => {
      console.log(`The server is running on http://localhost:${API_PORT}/graphql`)
    })
  });

  kafkaProducer.on('error', (err) => {
    console.log('Kafka Producer Error: ', err);
  });
}

const setupHUE = (username) => {
  // Philips Hue config
  huejay.discover().then(bridges => {

    console.log("Started Philips Hue config!")

    if (bridges.length === 0) return setupServer({})

    for (let bridge of bridges) {
      console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
    }

    let client = new huejay.Client({
      host: bridges[0].ip,
      username: username
    })

    client.users.getAll()
    .then(users => {
      for (let user of users) {
        console.log(`Username: ${user.username}`);
      }

      client.bridge.ping().then(() => {
        console.log('Successful connection to Philips Bridge');
        setupServer(client)
      }).catch(err => {
        console.log("Connection error with Philips Bridge!");
      })
    }).catch(err => {
      let user = new client.users.User;

      // Optionally configure a device type / agent on the user
      user.deviceType = 'huejay'; // Default is 'huejay'

      client.users.create(user)
      .then(user => {
        console.log(`New user created - Username: ${user.username}`);
        setupHUE(user.username);
      })
      .catch(error => {
        if (error instanceof huejay.Error && error.type === 101) {
          console.log(`Link button not pressed. Try again...`);
          setupHUE(process.env.HUE_USER);
        }

        console.log(error.stack);
      });
    })
  }).catch(err => {
    console.log(err)
  });
}

function createKafkaConsumer(kafkaClient) {
  const topic = process.env.KAFKA_TOPIC;
  const topics = [{ topic: topic, partition: 0 }];
  const options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };

  const consumer = new kafka.Consumer(kafkaClient, topics, options);

  consumer.on('message', function (message) {
    //console.log("Message: ", message);
  });

  consumer.on('error', function (err) {
    // Wait 5 minutes to retry checking Kafka topic
    setTimeout(() => {
      console.log(`Retrying to consume Kafka topic: ${topic}`);
      createKafkaConsumer(kafkaClient)
    }, 5000);
  });
}

setupHUE(process.env.HUE_USER)
