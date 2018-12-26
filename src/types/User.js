module.exports = `
type User {
  id: Int!
  username: String!
  email: String!
  listenerCommand: String
  commands: [Command]
  latestEEGClassification: EEGClassification
  pid: PID!
  philipsHueConfig: PhilipsHUEConfig!
  states: [String]!
}
`;
