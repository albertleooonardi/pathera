import { Sequelize } from "sequelize";
import db from "../Database.js";

const { DataTypes } = Sequelize;

const Questions = db.define(
  "questions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

(async () => {
  const AnswerKey = await import("./AnswerKey.js");

  Questions.hasMany(AnswerKey.default, {
    foreignKey: "question_id",
    as: "answerKey",
  });
})();

export default Questions;
