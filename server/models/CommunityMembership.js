const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const CommunityMembership = sequelize.define(
	"CommunityMembership",
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
	},
	{
		tableName: "community_memberships",
		timestamps: true,
		underscored: true,
		indexes: [
			{
				unique: true,
				fields: ['community_id', 'user_id'],
				name: 'cm_community_user_unique'
			}
		]
	}
);

module.exports = { CommunityMembership };

