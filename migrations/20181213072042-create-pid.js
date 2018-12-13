'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PIDs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      kp: {
        type: Sequelize.DOUBLE
      },
      ki: {
        type: Sequelize.DOUBLE
      },
      kd: {
        type: Sequelize.DOUBLE
      },
      k: {
        type: Sequelize.DOUBLE
      },
      setpoint: {
        type: Sequelize.DOUBLE
      },
      timeInterval: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('PIDs');
  }
};
