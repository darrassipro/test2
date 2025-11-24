const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const CommCategory = sequelize.define(
	"CommCategory",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		imageUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryPublicId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "community_categories",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { CommCategory };

