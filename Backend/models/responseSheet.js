import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ResponseSheet = sequelize.define('ResponseSheet', {
    responseSheetId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    serverStartTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    clientStartTime: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    gradingStatus: {
        type: DataTypes.ENUM("IN_PROGRESS", "AUTO_GRADED", "VALIDATED"),
        defaultValue: "IN_PROGRESS"
    }

})

export default ResponseSheet;