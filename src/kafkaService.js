const kafka = require('kafka-node')

let kafkaServiceInstance = null

class KafkaService {

  constructor() {
    this.client = this.createClient();
    this.producer = new kafka.Producer(this.client)

    this.client.on('ready', () => {
      console.log('Kafka client is connected and ready!')
      this.isReady = true
    })
    this.isReady = false

    this.client.on('error', (error) => {
      console.log('Kafka client failed to connect!')
      console.error(error)
    })
  }

  async onReady() {
    return await (new Promise((resolve, reject) => {
      while (!this.isReady) {
        await (this.sleep(100))
      }
      resolve(true);
    }))
  }

  createClient() {
    const kafkaServer = process.env.KAFKA_SERVER ? process.env.KAFKA_SERVER : 'kafka-server';
    const kafkaPort = process.env.KAFKA_PORT ? process.env.KAFKA_PORT : '9092';

    return new kafka.KafkaClient({
      kafkaHost: `${kafkaServer}:${kafkaPort}`,
      autoConnect: true
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = {
  getKafkaServiceInstance: () => {
    if (!kafkaServiceInstance) {
      kafkaServiceInstance = new KafkaService()
    }
    return kafkaServiceInstance
  }
}