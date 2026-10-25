import { Sequelize } from "sequelize";
import db from "../Database.js";

const { DataTypes } = Sequelize;

const AnswerDetails = db.define(
  "answer_details",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    practice_session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    sample_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

export const initAssociations = (PracticeSession, Question) => {
  AnswerDetails.belongsTo(PracticeSession, {
    foreignKey: "practice_session_id",
    as: "practiceSession",
  });

  PracticeSession.hasMany(AnswerDetails, {
    foreignKey: "practice_session_id",
    as: "answerDetails",
  });

  AnswerDetails.belongsTo(Question, {
    foreignKey: "question_id",
    as: "question",
  });
};

export default AnswerDetails;
