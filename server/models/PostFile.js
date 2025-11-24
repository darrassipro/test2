const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const PostFile = sequelize.define(
	"PostFile",
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
		url: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryPublicId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "post_files",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { PostFile };

