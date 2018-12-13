module.exports = `
type User {
  id: Int!
  username: String!
  email: String!
  listenerCommand: String
  commands: [Command]
  command (fromCommand: String!, type: String!, valueFrom: String, valueTo: String): Command
  latestEEGClassification: EEGClassification
  pid: PID
}
`;
