import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Answer = sequelize.define('Answer', {
    answerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    selectedOption: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    openTextResponse: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    maxScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    aiScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  gradingSource: {
    type: DataTypes.ENUM("AUTO_AI", "MANUAL_OVERRIDE", "NOT_GRADED"),
    defaultValue: "NOT_GRADED"
  },

  gradingConfidence: {
    type: DataTypes.FLOAT, // 0 → 1
    allowNull: true
  }
})

export default Answer;