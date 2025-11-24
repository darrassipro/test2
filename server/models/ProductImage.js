const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const ProductImage = sequelize.define(
	"ProductImage",
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
		isPrincipal: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		url: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cloudinaryId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "product_images",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { ProductImage };

