const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const FavoritePost = sequelize.define(
	"FavoritePost",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		postId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "posts",
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
	},
	{
		tableName: "favorite_posts",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ["user_id", "post_id"],
				name: "unique_user_post_favorite",
			},
		],
	}
);

module.exports = { FavoritePost };

