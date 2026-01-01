import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Teacher = sequelize.define('Teacher', {
    teacherId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        // validate: {
        //     isEmail: true
        // }
    },
    phoneNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
},{
    //Safe delete
    paranoid: true
})

export default Teacher;