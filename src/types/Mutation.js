module.exports = `
type Mutation {
  user: UserOps
  signup (username: String!, email: String!, password: String!): String
  login (email: String!, password: String!): String
}
`;
