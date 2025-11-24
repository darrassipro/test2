const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Story = sequelize.define(
	"Story",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		mediaUrl: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		cloudinaryPublicId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		caption: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		expiresAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
	},
	{
		tableName: "stories",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Story };

