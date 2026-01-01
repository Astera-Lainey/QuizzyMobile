'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  queryInterface.createTable("administrators", {
    adminId: {
      type: Sequelize.INTEGER,
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
