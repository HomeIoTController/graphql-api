module.exports = `
input EEGData {
  time: String
  theta: Int!
  lowAlpha: Int!
  highAlpha: Int!
  lowBeta: Int!
  highBeta: Int!
  lowGamma: Int!
  midGamma: Int!
  attention: Int!
  meditation: Int!
  blink: Int!
  feelingLabel: String
}`;
