import { Sequelize } from "sequelize";
import db from "../Database.js";
import Jobs from "./Jobs.js";
import Users from "./Users.js";

const { DataTypes } = Sequelize;

const JobMatches = db.define(
  "job_matches",
  {
    match_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.BIGINT,
      references: {
        model: Jobs,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    title_score: {
      type: DataTypes.FLOAT,
    },
    experience_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    degree_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    similarity: {
      type: DataTypes.FLOAT,
    },
  },
  {
    freezeTableName: true,
  }
);

Jobs.hasMany(JobMatches, { foreignKey: "job_id", as: "jobID" });
Users.hasMany(JobMatches, { foreignKey: "user_id", as: "userID" });

export default JobMatches;
