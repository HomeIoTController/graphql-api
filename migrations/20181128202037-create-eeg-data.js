'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('EEGData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      time: {
        type: Sequelize.DATE
      },
      theta: {
        type: Sequelize.INTEGER
      },
      lowAlpha: {
        type: Sequelize.INTEGER
      },
      highAlpha: {
        type: Sequelize.INTEGER
      },
      lowBeta: {
        type: Sequelize.INTEGER
      },
      highBeta: {
        type: Sequelize.INTEGER
      },
      lowGamma: {
        type: Sequelize.INTEGER
      },
      midGamma: {
        type: Sequelize.INTEGER
      },
      attention: {
        type: Sequelize.INTEGER
      },
      meditation: {
        type: Sequelize.INTEGER
      },
      blink: {
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
    return queryInterface.dropTable('EEGData');
  }
};