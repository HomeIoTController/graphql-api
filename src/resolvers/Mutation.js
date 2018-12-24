const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const moment = require('moment')
const axios = require('axios')

const { User, PID, Command, CommandHistory } = require('../../models')
const { getKafkaServiceInstance } = require('../kafkaService');
const { getPIDControllerInstance } = require('../PIDController');
const config = require('../config')

module.exports =  {
  // Handle user signup
  async signup (_, { username, email, password }) {

    if (await User.findOne({ where: { email } })) {
      throw new Error('User already registered with this email')
    }

    const user = await User.create({
      listenerCommand: process.env.DEFAULT_LISTENER_COMMAND,
      username,
      email,
      password: await bcrypt.hash(password, 10)
    })

    await PID.create({
      userId: user.id,
      kp: 1,
      ki: 1,
      kd: 1,
      k: 0,
      setpoint: 50, // 50% light
      timeInterval: 60, // 60 seconds
      active: false
    });

    // Return json web token
    return jsonwebtoken.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1y' }
    );
  },

  // Handles user login
  async login (_, { email, password }) {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      throw new Error('No user with that email')
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new Error('Incorrect password')
    }

    // Return json web token
    return jsonwebtoken.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1y' }
    )
  },

  async user(_, args, { user }) {
    // Make sure user is logged in
    if (!user) {
      throw new Error('You are not authenticated!')
    }
    return  {
      async updatePID({ kp, ki, kd, k, setpoint, timeInterval, active }) {
        const pid = await PID.update({
          kp,
          ki,
          kd,
          k,
          setpoint,
          timeInterval,
          active
        },
        {
          where: {
            userId: user.id
          }
        });
        return await PID.findByPk(pid[0]);
      },

      async sendEEGData({ data: eegData }) {
        eegData.userId = user.id;

        if (!eegData.state || eegData.state === "") {
          eegData.state = "?"
        }

        const message = JSON.stringify(eegData);
        const kafkaTopic = process.env.KAFKA_TOPIC;

        return (await new Promise(function(resolve, reject) {
          const kafkaProducer = getKafkaServiceInstance().producer;

          kafkaProducer.send([
            { topic: kafkaTopic, partition: 0, messages: [message], attributes: 0 }
          ], (err, result) => {
            if (err) reject(err);
            else resolve("Saved!")
          });
        }));
      },

      async updateStates({ states }) {
        return (await axios.post(`${config.eegAPI}/user/${user.id}/states`, states)).data;
      },

      async updateCommands ({ froms, tos, types, valuesFrom, valuesTo, listenerCommand }) {
        if (froms.length !== tos.length ||
            froms.length !== types.length ||
            froms.length !== valuesFrom.length ||
            froms.length !== valuesTo.length) {
          throw new Error('From and to must have same size!')
        }

        await Command.destroy({
          where: {
            userId: user.id
          }
        });

        for (let i = 0; i < froms.length; i++) {
          const from = froms[i];
          const to = tos[i];
          const valueFrom = valuesFrom[i];
          const valueTo = valuesTo[i];
          const type = types[i];

          await Command.create({
            userId: user.id,
            from,
            to,
            type,
            valueFrom,
            valueTo
          });
        }

        await User.update(
          {
            listenerCommand
          },
          {
            where: {
              id: user.id
            }
          }
        );

        return await Command.findAll({
          where: {
            userId: user.id
          }
        });
      },

      /* Not in use by any app */
      /* Classification is being supplied by a Kafka topic right now */
      async classifyEEGData({ data: eegData }) {
        eegData.userId = user.id;
        return (await axios.post(`${config.eegAPI}/eeg/classify`, eegData)).data;
      },

      async sendCommand ({ fromCommand, type, valueFrom, valueTo }, { philipsHueClient }) {
        if (!philipsHueClient || !philipsHueClient.lights){
          throw new Error('Philips Hue not connected!')
        }

        const lights = await philipsHueClient.lights.getAll();

        const command = await Command.findOne({
          where: {
            userId: user.id,
            from: fromCommand,
            type,
            valueFrom: valueFrom ? valueFrom : "",
            valueTo: valueTo ? valueTo : "",
          }
        });
        if (!command) throw new Error('Failed to find command!')

        const now = new Date()

        const pidParameters = await PID.findOne({
          where: {
            userId: user.id,
            active: true
          }
        });

        // Use PID to balance commands
        if (pidParameters) {
          const commandsHistory = await CommandHistory.findAll({
              where: {
                  userId: user.id,
                  createdAt: {
                      $gte: moment(now).subtract(pidParameters.timeInterval, "seconds").toDate(),
                      $lte: now
                  }
              },
              order: [
                ['createdAt', 'DESC'],
              ]
          });

          if (commandsHistory.length > 0) {
            command.to = getPIDControllerInstance()
            .getBalancedCommand(lights[0], command, commandsHistory, pidParameters.dataValues);
          }
        }


        await CommandHistory.create({
          userId: user.id,
          from: command.from,
          to: command.to
        });

        await Promise.all(lights.map(async (light) => {
          eval(command.to)
          await philipsHueClient.lights.save(light);
        }));

        return "Command executed!";
      }
    };
  }
}
