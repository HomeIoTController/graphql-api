class PIDController {

  constructor(setpoint) {

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
