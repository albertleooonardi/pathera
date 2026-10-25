import { Sequelize } from "sequelize";
import db from "../Database.js";
import Questions from "./Questions.js";

const { DataTypes } = Sequelize;

const AnswerKey = db.define(
  "answer_key",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "questions",
        key: "id",
      },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

AnswerKey.belongsTo(Questions, {
  foreignKey: "question_id",
  as: "question",
});

export default AnswerKey;
