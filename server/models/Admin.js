const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Admin = sequelize.define(
	"Admin",
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
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "admins",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['community_id', 'user_id'],
				name: 'admin_community_user_unique'
			},
			{
				fields: ['community_id'],
				name: 'admin_community_idx'
			},
			{
				fields: ['user_id'],
				name: 'admin_user_idx'
			}
		]
	}
);

module.exports = { Admin };

