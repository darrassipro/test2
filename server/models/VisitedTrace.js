const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const VisitedTrace = sequelize.define(
	"VisitedTrace",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		routeId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "routes",
				key: "id",
			},
		},
		longitude: {
			type: DataTypes.DECIMAL(10, 8),
			allowNull: false,
		},
		latitude: {
			type: DataTypes.DECIMAL(10, 8),
			allowNull: false,
		},
	},
	{
		tableName: "visited_traces",
		timestamps: true,
		underscored: true,
	}
);

module.exports = { VisitedTrace };

