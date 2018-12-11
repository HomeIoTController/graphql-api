module.exports = `
type UserOps {
  sendEEGData (data: EEGData!): String
  classifyEEGData (data: EEGData!): EEGClassification
  updateCommands (froms: [String]!, tos: [String]!, types: [String]!, valuesFrom: [String]!, valuesTo: [String]!, listenerCommand: String!): [Command]
  sendCommand (fromCommand: String!, type: String!, valueFrom: String, valueTo: String): String
}
`
