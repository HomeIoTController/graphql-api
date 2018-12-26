'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser-graphql')
const { graphqlExpress } = require('apollo-server-express')
const schema = require('./src/schema')
const jwt = require('express-jwt')
const cors = require('cors')
const loadServices = require('./src/services')

const API_PORT = process.env.API_PORT ? process.env.API_PORT : 3000

loadServices().then((ret) => {
  console.log("Ret: ", ret) 
  // create our express app
  const app = express()
  app.use(cors())

  // auth middleware
  const auth = jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false
  });

  // graphql endpoint
  app.use(
    '/graphql',
    bodyParser.graphql(),
    auth,
    graphqlExpress(req => ({
      schema,
      context: {
        user: req.user
      }
    })
  ));

  app.listen(API_PORT, () => {
    console.log(`The server is running on http://localhost:${API_PORT}/graphql`)
  });
}).catch(error => {
  console.log("Failed to load services: ", error);
});
