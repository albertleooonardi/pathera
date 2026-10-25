import { Sequelize } from "sequelize";
import db from "../Database.js";
import Users from "./Users.js";

const { DataTypes } = Sequelize;

const UserTitles = db.define(
  "user_titles",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    job_title: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

UserTitles.belongsTo(Users, { foreignKey: "user_id", as: "userID" });

export default UserTitles;
