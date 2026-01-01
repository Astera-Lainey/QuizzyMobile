'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  return queryInterface.createTable("students", {
    matricule: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
    },
    emailVerified: {
      type: Sequelize.BOOLEAN,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
  });
}
export async function down(queryInterface, Sequelize) {
  return queryInterface.dropTable('student');
}
