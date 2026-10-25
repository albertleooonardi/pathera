import { Sequelize } from "sequelize";
import db from "../Database.js";
import JobMatches from "./JobMatches.js";
import Skills from "./Skills.js";
import MatchedSkill from "./Skills.js";

const { DataTypes } = Sequelize;

const MatchedSkills = db.define(
  "matched_skills",
  {
    match_id: {
      type: DataTypes.INTEGER,
      references: {
        model: JobMatches,
        key: "match_id",
      },
    },
    matches: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

MatchedSkills.belongsTo(JobMatches, { foreignKey: "match_id", as: "matchID" });
Skills.hasMany(MatchedSkills, { foreignKey: "user_skill", as: "userSkill" });
MatchedSkill.hasMany(MatchedSkills, {
  foreignKey: "matched_skill",
  as: "matchedSkill",
});

export default MatchedSkills;
