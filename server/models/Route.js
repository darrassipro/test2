const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Route = sequelize.define(
	"Route",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		// Colonne essentielle pour les permissions
        creatorUserId: {
            type: DataTypes.UUID,
            allowNull: false, // Un trajet doit toujours avoir un créateur
			field: 'creator_user_id',  
            references: {
                model: 'users', 
                key: 'id',
            }
        },
		communityId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "communities",
				key: "id",
			},
		},
		isLive: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		publishDate: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		tableName: "routes",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Route };

