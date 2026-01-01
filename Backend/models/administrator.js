import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Administrator = sequelize.define('Administrator', {
    adminId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("student", "admin"),
        allowNull: false,
    }

},
{
    //Safe delete
    paranoid: true
})

export default Administrator;