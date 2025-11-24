const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		gmail: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: false,
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: false,
		},
		googleId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: false,
		},
		facebookId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: false,
		},
		provider: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		primaryIdentifier: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		profileImage: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		banner: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryImagePublicId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryBannerPublicId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		profileDescription: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		country: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		totalFollowers: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		totalFollowing: { // <-- AJOUTEZ CE CHAMP
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "Nombre d'utilisateurs que cet utilisateur suit."
        },
		totalCommunities: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		socialMediaLinks: { // exemple { facebook: 'https://www.facebook.com/username', twitter: 'https://www.twitter.com/username', instagram: 'https://www.instagram.com/username', linkedin: 'https://www.linkedin.com/in/username', youtube: 'https://www.youtube.com/channel/UC_x5XG1OV2P61WZu86_63mw' }
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: {},
		},
		// --- NOUVEAU CHAMP AJOUTÉ POUR LE RÔLE GLOBAL ---
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user', 
            comment: "Rôle global de l'utilisateur pour l'accès aux fonctionnalités administratives de l'API."
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
	},
	{
		tableName: "users",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { User };

