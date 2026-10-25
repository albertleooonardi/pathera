import { Sequelize } from "sequelize";
import db from "../Database.js";
import Jobs from "./Jobs.js";
import Users from "./Users.js";

const { DataTypes } = Sequelize;

const SavedJobs = db.define(
  "saved_jobs",
  {
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
  },
  {
    freezeTableName: true,
  }
);

SavedJobs.belongsTo(Jobs, { foreignKey: "job_id", as: "job" });
SavedJobs.belongsTo(Users, { foreignKey: "user_id", as: "user" });

export default SavedJobs;
