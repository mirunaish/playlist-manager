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
            references: { model: "zones" },
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

      transaction.commit();
    } catch (e) {
      console.error(e);
      transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.startTransaction();
    try {
      await queryInterface.dropTable("track_tag");
      await queryInterface.dropTable("track_artist");
      await queryInterface.dropTable("tracks");
      await queryInterface.dropTable("tags");
      await queryInterface.dropTable("artists");
      await queryInterface.dropTable("zones");

      await queryInterface.commitTransaction();
    } catch (e) {
      console.error(e);
      queryInterface.rollbackTransaction();
    }
  },
};
