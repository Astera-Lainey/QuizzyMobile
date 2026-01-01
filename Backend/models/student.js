import { DataTypes} from "sequelize";
import sequelize from "../config/database.js";

const Student = sequelize.define('Student', {
    matricule: {
        type: DataTypes.STRING,
        primaryKey: true,
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
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    studentCardId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    classId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("student", "admin"),
        allowNull: false,
    },
},
{
    //Safe delete
    paranoid: true
}
);

export default Student;
