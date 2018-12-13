'use strict';
module.exports = (sequelize, DataTypes) => {
  const PID = sequelize.define('PID', {
    userId: DataTypes.INTEGER,
    kp: DataTypes.DOUBLE,
    ki: DataTypes.DOUBLE,
    kd: DataTypes.DOUBLE,
    k: DataTypes.DOUBLE,
    setpoint: DataTypes.DOUBLE,
    timeInterval: DataTypes.INTEGER
  }, {});
  PID.associate = function(models) {
    // associations can be defined here
  };
  return PID;
};
