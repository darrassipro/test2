const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const PostShare = sequelize.define(
	"PostShare",
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
		shareText: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	},
	{
		tableName: "post_shares",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { PostShare };

