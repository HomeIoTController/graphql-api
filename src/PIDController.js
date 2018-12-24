let pidControllerInstance = null

class PIDController {

  getBalancedCommand(light, command, commandsHistory, pidParameters) {

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

    Object.keys(commandsMap).forEach(command => {
      const commandValues = commandsMap[command];

      let desired_brightness = commandValues.shift()

      let initialLightState = light.brightness;

      commandValues.forEach(commandValue => {
        if (commandValue > 0) initialLightState -= commandValue
        else initialLightState += Math.abs(commandValue)
      })

      const T = timeInterval;
      const process_variable = light.brightness + desired_brightness // PV is the current level of brightness of the light bulb
      const u = commandValues.slice(0).reverse().map(commandValue =>  {
        initialLightState += commandValue
        return initialLightState;
      })
      const prev_process_variable = u.length > 0 ? u[0] : 0;

      console.log("process_variable: ", process_variable);
      console.log("u: ", u);
      console.log("setpoint: ", setpoint);
      console.log("T: ", T);

      const e_t = this.e(setpoint, process_variable);

      console.log("e_t: ", e_t);

      const output_proportional_controller = Kp * e_t
      const output_integral_controller = Ki * (e_t + u.reduce(this.add, 0))
      const output_derivative_controller = Kd * ((e_t - this.e(setpoint, prev_process_variable)) / T)

      console.log("output_proportional_controller: ", output_proportional_controller);
      console.log("output_integral_controller: ", output_integral_controller);
      console.log("output_derivative_controller: ", output_derivative_controller);

      const u_t = output_proportional_controller + output_integral_controller + output_derivative_controller;
      let balancedCommandValue = Math.round(K * u_t);

      // Cast command back to its original format
      if (commandType[command] === Boolean)
        balancedCommandValue = Boolean(balancedCommandValue);
      else {
        balancedCommandValue = Number(balancedCommandValue).toFixed(2);
        if (balancedCommandValue > 0) {
          balancedCommandValue = Math.abs(desired_brightness).toFixed(2);
        }
      }

      console.log("balancedCommandValue: ", balancedCommandValue)



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
