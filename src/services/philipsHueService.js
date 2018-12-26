const huejay = require('huejay')
const BaseService = require('./baseService');

let philipsHueServiceInstance = null

class PhilipsHueService extends BaseService {

  constructor() {
    super();
  }

  async setup() {
    if (process.env.HUE_LOCAL_DEVICE_SETUP === 'true') {
      this.localMode = true;
      this.baseUsername = process.env.HUE_USER;
      return this.setupLocal(this.baseUsername);
    }
    return "Local setup is disabled, users are able to set remote Philips HUE IP address";
  }

  async connectToRemoteHUE(ip, port, username) {
    ip = ip.replace(/_/g, '').replace(/ /g, '')
    port = port.replace(/_/g, '').replace(/ /g, '')

    let client = new huejay.Client({
      host: ip,
      port,
      username
    });

    try {
      const users = await client.users.getAll();

      for (let user of users) {
        console.log(`Username: ${user.username}`);
      }

      try {
        await client.bridge.ping();
        return {
          ip,
          port,
          username,
          client
        };
      } catch(error) {
        throw new Error("Connection error with Philips Bridge!\n"+error);
      }
    } catch (error) {
      if (error.type === undefined) throw error;
      let user;
      try {
        user = await client.users.create(new client.users.User);
        console.log(`New user created - Username: ${user.username}`);
        return await this.connectToRemoteHUE(ip, port, user.username);
      } catch(error) {
        if (error.type === 101) {
          console.log(`Link button not pressed. Try again...`);
          return await this.connectToRemoteHUE(ip, port, username);
        }
        throw error;
      }
    }
  }

  async setupLocal(username) {

    let bridges;
    try {
      bridges = await huejay.discover();
    } catch(error) {
      throw new Error("No Philips HUE bridge found!\n"+error);
    }

    if (bridges.length === 0) {
      throw new Error("No Philips HUE bridge available!");
    }

    for (let bridge of bridges) {
      console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
    }

    let client = new huejay.Client({
      host: bridges[0].ip,
      username
    });

    let users;
    try {
      users = await client.users.getAll();

      for (let user of users) {
        console.log(`Username: ${user.username}`);
      }

      try {
        await client.bridge.ping();
        this.client = client;
        return "Philips HUE client is connected and ready!";
      } catch(error) {
        throw new Error("Connection error with Philips Bridge!\n"+error);
      }
    } catch(error) {
      if (error.type === undefined) throw error;
      let user;
      try {
        user = await client.users.create(new client.users.User);
        console.log(`New user created - Username: ${user.username}`);
        return await this.setup(user.username);
      } catch(error) {
        if (error.type === 101) {
          console.log(`Link button not pressed. Try again...`);
          return await this.setup(this.baseUsername);
        }
        throw error;
      }
    }
  }
}

module.exports = {
  getPhilipsHueServiceInstance: () => {
    if (!philipsHueServiceInstance) {
      console.log("Started Philips HUE config!")
      philipsHueServiceInstance = new PhilipsHueService()
      return philipsHueServiceInstance.setup()
    }
    return philipsHueServiceInstance
  }
}
