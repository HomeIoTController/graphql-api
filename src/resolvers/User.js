const { User, Command } = require('../../models')

module.exports = {
  // fetch the commands of currenly athenticated user
  async commands(user) {
    const commands = await Command.findAll({
      where: {
        userId: user.id
      }
    });

    if (!commands) throw new Error('Failed to find commands!')

    return commands;
  },

  async command(user, { fromCommand, type, valueFrom, valueTo }) {
    if (!fromCommand || !type){
      throw new Error('fromCommand and type are mandatory!');
    }

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

    return command;
  }
}
