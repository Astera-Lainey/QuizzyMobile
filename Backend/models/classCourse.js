import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ClassCourse = sequelize.define('ClassCourse', {
    // level: {
    //     type: DataTypes.STRING,
    //     primaryKey: true,
    //     allowNull: false,
    // },
    // department: {
    //     type: DataTypes.STRING,
    //     primaryKey: true,
    //     allowNull: false,
    // },
    // courseCode: {
    //     type: DataTypes.STRING,
    //     primaryKey: true,
    //     allowNull: false,
    // },
    credit: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default ClassCourse;