import { Sequelize } from "sequelize";
import db from "../Database.js";
import AnswerDetails from "./AnswerDetails.js";

const { DataTypes } = Sequelize;

const PracticeSession = db.define(
  "practice_sessions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    job_title: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

PracticeSession.hasMany(AnswerDetails, {
  foreignKey: "practice_session_id",
  onDelete: "CASCADE",
});

AnswerDetails.belongsTo(PracticeSession, {
  foreignKey: "practice_session_id",
});

export default PracticeSession;
