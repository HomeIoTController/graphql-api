'use strict'

const { User, Command, CommandHistory } = require('../models')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const moment = require('moment')

require('dotenv').config()

const resolvers = {
  Query: {
    // fetch the profile of currenly athenticated user
    async me (_, args, { user }) {
      // Make sure user is logged in
      if (!user) {
        throw new Error('You are not authenticated!')
      }

      // user is authenticated
      return await User.findById(user.id)
    },

    // fetch the commands of currenly athenticated user
    async commands (_, args, { user }) {
      // Make sure user is logged in
      if (!user) {
        throw new Error('You are not authenticated!')
      }

      return await Command.findAll({
        where: {
          userId: user.id
        }
      });
    }
  },

  Mutation: {
    // Handle user signup
    async signup (_, { username, email, password }) {

      if (await User.findOne({ where: { email } })) {
        throw new Error('User already registered with this email')
      }

      const user = await User.create({
        listenerCommand: "hello",
        username,
        email,
        password: await bcrypt.hash(password, 10)
      })

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

    async updateCommands (_, { froms, tos, types, valuesFrom, valuesTo, listenerCommand }, { user }) {

      // Make sure user is logged in
      if (!user) {
        throw new Error('You are not authenticated!')
      }

      if (!listenerCommand) {
        throw new Error('Listener command must not be null!')
      }

      if (!froms || !tos || !types || !valuesFrom || !valuesTo ||
        froms.length !== tos.length ||
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

    async sendEEGData(_, eegData, { user, kafkaProducer }) {
      if (!user) {
        throw new Error('No user with that email')
      }
      eegData.userId = user.id;

      if (!eegData.feelingLabel || eegData.feelingLabel === "") {
        eegData.feelingLabel = "?"
      }

      const message = JSON.stringify(eegData);
      const kafkaTopic = process.env.KAFKA_TOPIC;

      kafkaProducer.send([
        { topic: kafkaTopic, partition: 0, messages: [message], attributes: 0 }
      ], (err, result) => {
        console.log("err: ", err);
        console.log("result: ", result)
      });
      //await EEGData.create(eegData);
    },

    async sendCommand (_, { fromCommand, type, valueFrom, valueTo }, { user, philipsHueClient }) {
      if (!user) {
        throw new Error('No user with that email')
      }

      if (!fromCommand || !type){
        throw new Error('fromCommand and type are mandatory!');
      }

      if (!philipsHueClient.lights){
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
      if (!command) return "Failed to find command!";

      await CommandHistory.create({
        userId: user.id,
        commandId: command.id,
        identifier: user.iat,
      });

      const now = new Date()

      const commandsHistory = await CommandHistory.findAll({
          where: {
              userId: user.id,
              identifier: user.iat,
              createdAt: {
                  $gte: moment(now).subtract(1, "minutes").toDate(),
                  $lte: now
              }
          },
          include: [{
            model: Command
          }]
      });

      /*const commandsHistoryMap = {};

      // Create a map with previously executed commands in the last minute
       commandsHistory.forEach(commandHistory => {
        const nameValue = commandHistory.Command.to.replace(/ /g,'').split("=")
        if (!commandsHistoryMap[nameValue[0]]) {
          commandsHistoryMap[nameValue[0]] = {}
        }
        if (!commandsHistoryMap[nameValue[0]][nameValue[1]]) {
          commandsHistoryMap[nameValue[0]][nameValue[1]] = 0;
        }
        commandsHistoryMap[nameValue[0]][nameValue[1]] += 1
      });

      const nameValue = command.to.replace(/ /g,'').split("=")*/

      await Promise.all(lights.map(async (light) => {
        console.log("light: ", light)
        //eval(command.to)
        //await philipsHueClient.lights.save(light);
      }));

      return "Command executed!";
    },
  }
}

module.exports = resolvers
