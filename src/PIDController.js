let pidControllerInstance = null

class PIDController {

  getBalancedCommand(command, commandsHistory, pidParameters) {

    // 1) Parse commands to Map
    const commandsMap = {};
    this.clearCommand(command.to)
    .forEach(command => {
      const [commandName, commandValue ] = command.split("=");
      // Push current command to list
      if (!commandsMap[commandName]) commandsMap[commandName] = [commandValue];
    })
    // The history includes the current emitted command
    commandsHistory.forEach(commandHistory => {
      this.clearCommand(commandHistory.to)
      .forEach(historyCommand => {
        const [historyCommandName, historyCommandValue ] = historyCommand.split("=");
        if (commandsMap[historyCommandName]) {
          commandsMap[historyCommandName].push(historyCommandValue);
        }
      });
    });

    const commandType = {};

    // 2) Parse values to Number (we have Boolean options)
    Object.keys(commandsMap).forEach(command => {
        commandsMap[command] = commandsMap[command].map(commandValue => {
          if (commandValue === 'true') {
            commandValue = 100
            commandType[command] = Boolean
          } else if (commandValue === 'false') {
            commandValue = 0
            commandType[command] = Boolean
          } else {
            commandValue = Number(commandValue)
            commandType[command] = Number
          }
          return commandValue;
        });
    });

    // 3) Calculate the new command (balance it out)
    const {
      kp: Kp,
      ki: Ki,
      kd: Kd,
      k: K,
      setpoint,
      timeInterval
    } = pidParameters;

    let balancedCommands = "";

    console.log("commandsMap: ", commandsMap)

    Object.keys(commandsMap).forEach(command => {
      const commandValues = commandsMap[command];

      console.log("commandValues: ", commandValues);

      const T = timeInterval;
      const y = commandValues.shift(); // gets the current command that will be emitted
      const u = commandValues // gets all the commands without the current desired one

      const e_t = this.e(setpoint, y);
      const u_t = (Kp * e_t) + (Ki * (e_t + u.reduce(this.add, 0))) + (Kd * (e_t - this.e(setpoint, y))/T);
      let balancedCommandValue = y + (K * u_t);

      console.log("balancedCommandValue: ", balancedCommandValue)

      // Cast command back to its original format
      if (commandType[command] === Boolean)
        balancedCommandValue = Boolean(balancedCommandValue);
      else
        balancedCommandValue = Number(balancedCommandValue).toFixed(2);

      balancedCommands = balancedCommands + command + "=" + balancedCommandValue + ";"
    });
    return balancedCommands;

  }

  e(setpoint, process_variable) {
      return setpoint - process_variable
  }

  add(a, b) {
    return a + b;
  }

  calculateCommands(command, commandsMap, pidParameters) {

    console.log("balancedCommands: ", balancedCommands)
    return balancedCommands;
  }

  clearCommand(command) {
    return command
      .replace(/ /g,'') // Remove empty space
      .split(";") // Find all commands in line
      .filter(command => command !== '') // Remove empty commands
  }


}

module.exports = {
  getPIDControllerInstance: () => {
    if (!pidControllerInstance) {
      pidControllerInstance = new PIDController()
    }
    return pidControllerInstance
  }
}
