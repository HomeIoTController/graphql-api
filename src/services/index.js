const { getKafkaServiceInstance } = require('./kafkaService')
const { getPhilipsHueServiceInstance } = require('./philipsHueService')

function loadServices() {
  return Promise.all([
    getKafkaServiceInstance(),
    getPhilipsHueServiceInstance()
  ])
}

module.exports = loadServices;
