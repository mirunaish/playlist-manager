"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn("artists", "zoneId", { transaction });
      await queryInterface.removeColumn("tags", "zoneId", { transaction });
      await queryInterface.removeColumn("tracks", "zoneId", { transaction });
      await queryInterface.dropTable("zones", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        "zones",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          name: { type: Sequelize.STRING, allowNull: false },
          theme: { type: Sequelize.STRING, allowNull: false },
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "artists",
        "zoneId",
        {
          type: Sequelize.UUID,
          references: { model: "zones", key: "id" },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "tags",
        "zoneId",
        {
          type: Sequelize.UUID,
          references: { model: "zones", key: "id" },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "tracks",
        "zoneId",
        {
          type: Sequelize.UUID,
          references: { model: "zones", key: "id" },
        },
        { transaction }
      );

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
