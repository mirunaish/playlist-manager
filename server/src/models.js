import { DataTypes } from "sequelize";

export function artist(sequelize) {
  return sequelize.define(
    "Artist",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      starred: { type: DataTypes.BOOLEAN, allowNull: false },
      group: { type: DataTypes.UUID, allowNull: true },
      zoneId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Zone, key: "id" },
      },
    },
    { timestamps: false }
  );
}

export function tag(sequelize) {
  return sequelize.define(
    "Tag",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      zoneId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Zone, key: "id" },
      },
    },
    { timestamps: false }
  );
}

export function track(sequelize) {
  return sequelize.define(
    "Track",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      url: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      length: { type: DataTypes.INTEGER, allowNull: false }, // in seconds
      imageLink: { type: DataTypes.STRING, allowNull: true },
      rating: { type: DataTypes.INTEGER, allowNull: false }, // 0-6
      zoneId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Zone, key: "id" },
      },
    },
    { timestamps: false }
  );
}

export function trackArtist(sequelize) {
  return sequelize.define(
    "TrackArtist",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      trackId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Track, key: "id" },
      },
      artistId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Artist, key: "id" },
      },
      main: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    { tableName: "track_artist", timestamps: false }
  );
}

export function trackTag(sequelize) {
  return sequelize.define(
    "TrackTag",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      trackId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Track, key: "id" },
      },
      tagId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Tag, key: "id" },
      },
    },
    { tableName: "track_tag", timestamps: false }
  );
}

export function zone(sequelize) {
  return sequelize.define(
    "Zone", // TODO should this be lowercase zone?
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      theme: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "zones", timestamps: false }
  );
}
