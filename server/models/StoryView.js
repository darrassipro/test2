const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const StoryView = sequelize.define(
	"StoryView",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		storyId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "stories",
				key: "id",
			},
		},
		viewerId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
	},
	{
		tableName: "story_views",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ["story_id", "viewer_id"],
				name: "unique_story_viewer",
			},
		],
	}
);

module.exports = { StoryView };

