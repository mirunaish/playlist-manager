import { DataTypes } from "sequelize";

export function defTrack(sequelize) {
  return sequelize.define(
    "Track",
    {
      id: { type: DataTypes.UUID },
      url: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false }, // 0-6
    },
    { timestamps: false }
  );
}

export function defArtist(sequelize) {
  return sequelize.define(
    "Artist",
    {
      id: { type: DataTypes.UUID },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: false }
  );
}

export function defAuthorship(sequelize) {
  return sequelize.define(
    "Authorship",
    {
      id: { type: DataTypes.UUID },
      trackId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Track, key: "id" },
      },
      artistId: {
        type: DataTypes.UUID,
        references: { model: sequelize.models.Artist, key: "id" },
      },
    },
    { timestamps: false }
  );
}
