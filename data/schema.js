'use strict'

const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

// Define our schema using the GraphQL schema language
const typeDefs = `
  type User {
    id: Int!
    username: String!
    email: String!
    listenerCommand: String
  }

  type Command {
    id: Int!
    userId: Int!
    from: String!
    to: String!
    type: String!
    valueTo: String
    valueFrom: String
  }

  type Query {
    me: User
    commands: [Command]
  }

  type Mutation {
    signup (username: String!, email: String!, password: String!): String
    login (email: String!, password: String!): String
    updateCommands (froms: [String]!, tos: [String]!, types: [String]!, valuesFrom: [String]!, valuesTo: [String]!, listenerCommand: String!): [Command]
    sendCommand (fromCommand: String!, type: String!, valueFrom: String, valueTo: String): String
    sendEEGData (time: String!, theta: Int!, lowAlpha: Int!, highAlpha: Int!, lowBeta: Int!, highBeta: Int!, lowGamma: Int!, midGamma: Int!, attention: Int!, meditation: Int!, blink: Int!): String
  }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
