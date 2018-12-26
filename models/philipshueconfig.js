'use strict';
module.exports = (sequelize, DataTypes) => {
  const PhilipsHUEConfig = sequelize.define('PhilipsHUEConfig', {
    userId: DataTypes.INTEGER,
    ip: DataTypes.STRING,
    port: DataTypes.STRING,
    username: DataTypes.STRING
  }, {});
  PhilipsHUEConfig.associate = function(models) {
    // associations can be defined here
  };
  return PhilipsHUEConfig;
};
