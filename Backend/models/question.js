import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Question = sequelize.define('Question', {
    questionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("MCQ", "Open", "Close"),
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // points: {
    //     type: DataTypes.FLOAT,
    //     allowNull: false,
    // },

},
{
    //Safe delete
    paranoid: true
})

export default Question;