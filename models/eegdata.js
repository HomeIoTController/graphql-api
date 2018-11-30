'use strict';
module.exports = (sequelize, DataTypes) => {
  const EEGData = sequelize.define('EEGData', {
    userId: DataTypes.INTEGER,
    time: DataTypes.DATE,
    theta: DataTypes.INTEGER,
    lowAlpha: DataTypes.INTEGER,
    highAlpha: DataTypes.INTEGER,
    lowBeta: DataTypes.INTEGER,
    highBeta: DataTypes.INTEGER,
    lowGamma: DataTypes.INTEGER,
    midGamma: DataTypes.INTEGER,
    attention: DataTypes.INTEGER,
    meditation: DataTypes.INTEGER,
    blink: DataTypes.INTEGER,
    feelingLabel: DataTypes.STRING
  }, {});
  EEGData.associate = function(models) {
    // associations can be defined here
  };
  return EEGData;
};
