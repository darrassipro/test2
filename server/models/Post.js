const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Post = sequelize.define(
	"Post",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		communityId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "communities",
				key: "id",
			},
		},
		contentType: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		isVr: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		postCategory: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "post_categories",
				key: "id",
			},
		},
		hotelNuiteeId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		vrUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		publicationDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
		},
		isVisibleOutsideCommunity: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		isBoosted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		sponsorId: {
			type: DataTypes.UUID,
			allowNull: true,
		},
		visitedTraceId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "visited_traces",
				key: "id",
			},
		},
		status: { 
         type: DataTypes.ENUM('pending', 'approved', 'rejected'),
         defaultValue: 'approved', 
         allowNull: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
	},
	{
		tableName: "posts",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Post };

