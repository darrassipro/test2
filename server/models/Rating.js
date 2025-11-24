const { DataTypes } = require("sequelize");
const db = require("../config/db");

const sequelize = db.getSequelize();

const Rating = sequelize.define(
    "Rating",
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
            onDelete: 'CASCADE', 
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users", 
                key: "id",
            },
            onDelete: 'CASCADE', 
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            }
        },
    },
    {
        tableName: "ratings",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['product_id', 'user_id']
            }
        ]
    }
);

module.exports = { Rating };