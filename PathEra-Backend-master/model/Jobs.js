import { Sequelize } from "sequelize";
import db from "../Database.js";
import Companies from "./Companies.js";

const { DataTypes } = Sequelize;

const Jobs = db.define(
  "jobs",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    job_title: {
      type: DataTypes.STRING,
    },
    job_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    min_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
job_description: {
    type: DataTypes.TEXT, 
    allowNull: true,
  },
    job_link: {
      type: DataTypes.STRING,
    },
    date_posted: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Companies,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Jobs.belongsTo(Companies, { foreignKey: "company_id", as: "companyId" });

export default Jobs;
