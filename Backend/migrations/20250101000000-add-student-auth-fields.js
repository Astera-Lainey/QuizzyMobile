'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  // Ajouter le champ studentCardId
  await queryInterface.addColumn('students', 'studentCardId', {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true,
  });

  // Ajouter le champ emailVerificationToken
  await queryInterface.addColumn('students', 'emailVerificationToken', {
    type: Sequelize.STRING,
    allowNull: true,
  });

  // Mettre à jour emailVerified pour avoir une valeur par défaut
  await queryInterface.changeColumn('students', 'emailVerified', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  });

  // Ajouter le champ classId s'il n'existe pas déjà
  const tableDescription = await queryInterface.describeTable('students');
  if (!tableDescription.classId) {
    await queryInterface.addColumn('students', 'classId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'classes',
        key: 'classId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('students', 'studentCardId');
  await queryInterface.removeColumn('students', 'emailVerificationToken');
  
  const tableDescription = await queryInterface.describeTable('students');
  if (tableDescription.classId) {
    await queryInterface.removeColumn('students', 'classId');
  }
}

