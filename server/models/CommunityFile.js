const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const CommunityFile = sequelize.define(
	"CommunityFile",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		communityId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "communities",
				key: "id",
			},
		},
		isPrincipale: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		url: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "community_files",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { CommunityFile };

