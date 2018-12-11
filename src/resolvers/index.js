'use strict'

require('dotenv').config()

const User = require("./User")
const Query = require("./Query")
const Mutation = require("./Mutation")

const resolvers = {
  User,
  Query,
  Mutation
}

module.exports = resolvers
