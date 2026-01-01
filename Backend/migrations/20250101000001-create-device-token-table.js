'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('deviceTokens', {
    deviceTokenId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    matricule: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'students',
        key: 'matricule'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    deviceType: {
      type: Sequelize.ENUM('ios', 'android', 'web'),
      allowNull: false,
    },
    deviceId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    lastUsedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  // Créer les index
  await queryInterface.addIndex('deviceTokens', ['token'], {
    unique: true,
    name: 'deviceTokens_token_unique'
  });

  await queryInterface.addIndex('deviceTokens', ['matricule'], {
    name: 'deviceTokens_matricule_index'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('deviceTokens');
}

