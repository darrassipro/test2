const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const ProductFile = sequelize.define(
	"ProductFile",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "products",
				key: "id",
			},
		},
		url: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		type: {
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
		isVideo: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		time: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		cloudinaryId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "product_files",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { ProductFile };

