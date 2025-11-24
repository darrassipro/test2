const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Comment = sequelize.define(
	"Comment",
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
		replyId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "comments",
				key: "id",
			},
		},
		commentText: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		 isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
	},
	{
		tableName: "comments",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Comment };

