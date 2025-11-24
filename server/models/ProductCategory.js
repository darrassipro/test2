const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const ProductCategory = sequelize.define(
	"ProductCategory",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "product_categories",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { ProductCategory };

