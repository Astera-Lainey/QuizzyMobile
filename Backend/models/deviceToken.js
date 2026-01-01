import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DeviceToken = sequelize.define('DeviceToken', {
    deviceTokenId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    deviceType: {
        type: DataTypes.ENUM("ios", "android", "web"),
        allowNull: false,
    },
    deviceId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['matricule']
        }
    ],
    paranoid: true
});

export default DeviceToken;

