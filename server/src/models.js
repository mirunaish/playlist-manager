import { DataTypes } from "sequelize";

export function artist(sequelize) {
  return sequelize.define(
    "Artist",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      starred: { type: DataTypes.BOOLEAN, allowNull: false },
      group: { type: DataTypes.UUID, allowNull: true },
    },
    { tableName: "artists", timestamps: false }
  );
}

export function tag(sequelize) {
  return sequelize.define(
    "Tag",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      color: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "tags", timestamps: false }
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
    },
    { tableName: "tracks", timestamps: false }
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
      main: { type: DataTypes.BOOLEAN, allowNull: false }, // TODO
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

export function associations(sequelize) {
  const m = sequelize.models;

  m.Artist.hasMany(m.TrackArtist, { foreignKey: "artistId" });

  m.Tag.hasMany(m.TrackTag, { foreignKey: "tagId" });

  m.Track.hasMany(m.TrackArtist, { foreignKey: "trackId" });
  m.Track.hasMany(m.TrackTag, { foreignKey: "trackId" });

  m.TrackArtist.belongsTo(m.Track, { foreignKey: "trackId" });
  m.TrackArtist.belongsTo(m.Artist, { foreignKey: "artistId" });

  m.TrackTag.belongsTo(m.Track, { foreignKey: "trackId" });
  m.TrackTag.belongsTo(m.Tag, { foreignKey: "tagId" });
}
