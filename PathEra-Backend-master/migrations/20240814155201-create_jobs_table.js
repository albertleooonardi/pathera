"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("jobs", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
      },
      job_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      job_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      job_level: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      job_model: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      job_industry: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      min_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      degree: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      job_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      job_link: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_posted: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "companies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("jobs");
  },
};
