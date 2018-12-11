module.exports = `
type Command {
  id: Int!
  userId: Int!
  from: String!
  to: String!
  type: String!
  valueTo: String
  valueFrom: String
}
`;
