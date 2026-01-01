import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Course = sequelize.define('Course', {
    courseCode: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    courseName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // credit: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    // teacher: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },

},
{
    //Safe delete
    paranoid: true
});

export default Course;