import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AcademicYear = sequelize.define('AcademicYear', {
    yearId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    isPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

})

export default AcademicYear;