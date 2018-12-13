'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommandHistory = sequelize.define('CommandHistory', {
    userId: DataTypes.INTEGER,
    from: DataTypes.STRING,
    to: DataTypes.STRING
  }, {});
  CommandHistory.associate = function(models) {
  };
  return CommandHistory;
};
