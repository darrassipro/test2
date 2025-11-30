const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Community = sequelize.define(
	"Community",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		creatorUserId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		totalMembers: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		totalProducts: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		totalPosts: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
		isPremium: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		isDeleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		country: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		facebookLink: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		instagramLink: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		whatsappLink: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "communities",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Community };

