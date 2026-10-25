import { Sequelize } from "sequelize";
import db from "../Database.js";
import Users from "./Users.js";
import Skills from "./Skills.js";

const { DataTypes } = Sequelize;

const UserSkills = db.define(
  "user_skills",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
    },
    skill_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Skills,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

UserSkills.belongsTo(Users, { foreignKey: "user_id", as: "userID" });
UserSkills.belongsTo(Skills, { foreignKey: "skill_id", as: "skillID" });

export default UserSkills;
