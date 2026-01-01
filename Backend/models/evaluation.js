import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Evaluation = sequelize.define('Evaluation', {
    evaluationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    publishedDate: {
        type: DataTypes.DATEONLY,
    },
    uploadDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("Mid Term","CC", "Final Exam", "TP", "Resit", "TD", "Other"),
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("Draft", "Published", "Completed"),
        defaultValue: "Draft",
        allowNull: false,
    },

},
{
    //Safe delete
    paranoid: true
})

export default Evaluation;