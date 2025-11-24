const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const CommentLike = sequelize.define(
	"CommentLike",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		commentId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "comments",
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
		tableName: "comment_likes",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ["user_id", "comment_id"],
				name: "unique_user_comment_like",
			},
		],
	}
);

module.exports = { CommentLike };

