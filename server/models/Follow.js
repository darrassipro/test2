const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Follow = sequelize.define(
	"Follow",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		followerId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		followingId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
	},
	{
		tableName: "follows",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['follower_id', 'following_id'],
				name: 'follow_follower_following_unique'
			},
			{
				fields: ['follower_id'],
				name: 'follow_follower_idx'
			},
			{
				fields: ['following_id'],
				name: 'follow_following_idx'
			}
		]
	}
);

module.exports = { Follow };

