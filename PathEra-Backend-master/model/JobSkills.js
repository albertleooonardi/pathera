import { Sequelize } from "sequelize";
import db from "../Database.js";
import Jobs from "./Jobs.js";
import Skills from "./Skills.js";

const { DataTypes } = Sequelize;

// Define JobSkills model
const JobSkills = db.define(
  "job_skills",
  {
    job_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    skill_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  const JobsModule = await import("./Jobs.js");
  const SkillsModule = await import("./Skills.js");
  const Jobs = JobsModule.default;
  const Skills = SkillsModule.default;

  Jobs.hasMany(JobSkills, { foreignKey: "job_id", as: "jobSkills" });
  JobSkills.belongsTo(Jobs, { foreignKey: "job_id", as: "jobID" });

  Skills.hasMany(JobSkills, { foreignKey: "skill_id", as: "jobSkills" });
  JobSkills.belongsTo(Skills, { foreignKey: "skill_id", as: "skill" });
})();

export default JobSkills;
