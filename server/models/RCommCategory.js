const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const RCommCategory = sequelize.define(
	"RCommCategory",
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
		communityCategoryId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "community_categories",
				key: "id",
			},
		},
	},
	{
		tableName: "r_community_categories",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['community_id', 'community_category_id'],
				name: 'ccr_community_category_unique'
			}
		]
	}
);

module.exports = { RCommCategory };