const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

// Label : ce modele est créé pour les labels des stories.
// exemple : "Travel", "Food" ...

const Label = sequelize.define(
	"Label",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryPublicId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "labels",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Label };

