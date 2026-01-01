import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Notification = sequelize.define('Notification', {
    notificationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sentAt: {
        type: DataTypes.DATE,
    },
    type: {
        type: DataTypes.ENUM("Published", "Reminder"),
        allowNull: false,
    },
})

export default Notification;