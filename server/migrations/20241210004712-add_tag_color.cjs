"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tags", "color", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "#000000",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tags", "color");
  },
};
