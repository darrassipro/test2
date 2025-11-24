const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Product = sequelize.define(
	"Product",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		categoryId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "product_categories",
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
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
		},
		title: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		rating: {
			type: DataTypes.DECIMAL(3, 2),
			allowNull: true,
			defaultValue: 0,
		},
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
		isFree: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		totalCommands: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},
	{
		tableName: "products",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { Product };

