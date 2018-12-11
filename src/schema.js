'use strict'

const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const Command = require('./types/Command')
const EEGClassification = require('./types/EEGClassification')
const User = require('./types/User')
const UserOps = require('./types/UserOps')
const Query = require('./types/Query')
const Mutation = require('./types/Mutation')

const EEGData = require('./inputs/EEGData')

// Define our schema using the GraphQL schema language
const typeDefs = `
${EEGData}
${Command}
${EEGClassification}
${UserOps}
${User}
${Query}
${Mutation}
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
