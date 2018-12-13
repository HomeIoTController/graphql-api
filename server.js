'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser-graphql')
const { graphqlExpress } = require('apollo-server-express')
const schema = require('./src/schema')
const jwt = require('express-jwt')
const cors = require('cors')
const huejay = require('huejay')
const { getKafkaServiceInstance } = require('./src/kafkaService')

const API_PORT = process.env.API_PORT ? process.env.API_PORT : 3000

const kafkaService = getKafkaServiceInstance();

// create our express app
const app = express()
app.use(cors())

function setupServer(philipsHueClient) {
  // auth middleware
  const auth = jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false
  }); 

  kafkaService.onReady().then(() => {
    // graphql endpoint
    app.use(
      '/graphql',
      bodyParser.graphql(),
      auth,
      graphqlExpress(req => ({
        schema,
        context: {
          user: req.user,
          philipsHueClient
        }
      }))
    );

    app.listen(API_PORT, () => {
      console.log(`The server is running on http://localhost:${API_PORT}/graphql`)
    })
  });
}

function setupHUE(username) {
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
        console.log(err)
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

setupHUE(process.env.HUE_USER)
