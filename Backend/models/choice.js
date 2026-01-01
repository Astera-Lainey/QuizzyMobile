import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Choice = sequelize.define('Choice', {
    choiceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

}, {
    paranoid: true,
});

export default Choice;