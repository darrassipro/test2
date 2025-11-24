const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const StoryHighlight = sequelize.define(
	"StoryHighlight",
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
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		labelId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "labels",
				key: "id",
			},
		},
	},
	{
		tableName: "story_highlights",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { StoryHighlight };

