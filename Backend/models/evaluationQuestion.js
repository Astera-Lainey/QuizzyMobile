import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const EvaluationQuestion = sequelize.define('EvaluationQuestion', {
    points: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

export default EvaluationQuestion;