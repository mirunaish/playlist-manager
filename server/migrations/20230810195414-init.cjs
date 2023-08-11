"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "zones",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          name: { type: Sequelize.STRING, allowNull: false },
        },
        { transaction }
      );

      await queryInterface.createTable(
        "artists",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          name: { type: Sequelize.STRING, allowNull: false },
          starred: { type: Sequelize.BOOLEAN, allowNull: false },
          group: { type: Sequelize.UUID, allowNull: true },
        },
        { transaction }
      );

      await queryInterface.createTable(
        "tags",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          name: { type: Sequelize.STRING, allowNull: false },
          zoneId: {
            type: Sequelize.UUID,
            references: { model: "zones", key: "id" },
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        "tracks",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          url: { type: Sequelize.STRING, allowNull: false },
          title: { type: Sequelize.STRING, allowNull: false },
          length: { type: Sequelize.INTEGER, allowNull: false }, // in seconds
          imageLink: { type: Sequelize.STRING, allowNull: true },
          rating: { type: Sequelize.INTEGER, allowNull: false }, // 0-6
          zoneId: {
            type: Sequelize.UUID,
            references: { model: "zones", key: "id" },
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        "track_artist",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          trackId: {
            type: Sequelize.UUID,
            references: { model: "tracks", key: "id" },
          },
          artistId: {
            type: Sequelize.UUID,
            references: { model: "artists", key: "id" },
          },
          main: { type: Sequelize.BOOLEAN, allowNull: false },
        },
        { transaction }
      );

      await queryInterface.createTable(
        "track_tag",
        {
          id: { type: Sequelize.UUID, primaryKey: true },
          trackId: {
            type: Sequelize.UUID,
            references: { model: "tracks", key: "id" },
          },
          tagId: {
            type: Sequelize.UUID,
            references: { model: "tags", key: "id" },
          },
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

  async down(queryInterface, Sequelize) {
    const transaction = queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable("track_tag", { transaction });
      await queryInterface.dropTable("track_artist", { transaction });
      await queryInterface.dropTable("tracks", { transaction });
      await queryInterface.dropTable("tags", { transaction });
      await queryInterface.dropTable("artists", { transaction });
      await queryInterface.dropTable("zones", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
