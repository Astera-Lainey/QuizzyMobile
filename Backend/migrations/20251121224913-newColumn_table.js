'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('administrators', 'role', {
    type: Sequelize.ENUM('student', 'admin'),
    allowNull: false,
    // defaultValue: 'student'
  }
  );
}
export async function down(queryInterface, Sequelize) {
  return queryInterface.removeColumn('administrators', 'role');
}
