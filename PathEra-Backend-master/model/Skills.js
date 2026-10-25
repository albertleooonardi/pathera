import { Sequelize } from "sequelize";
import JobSkills from "./JobSkills.js";
import db from "../Database.js";

const { DataTypes } = Sequelize;

const Skills = db.define(
  "skills",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    skill_name: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Skills;
