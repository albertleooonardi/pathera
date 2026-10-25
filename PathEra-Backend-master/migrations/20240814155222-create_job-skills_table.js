"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("job_skills", {
      job_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "jobs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      skill_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "skills",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
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

    // Add composite primary key
    await queryInterface.addConstraint("job_skills", {
      fields: ["job_id", "skill_id"],
      type: "primary key",
      name: "pk_job_skills",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("job_skills");
  },
};
