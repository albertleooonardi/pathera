import { Sequelize } from "sequelize";
import db from "../Database.js";

const { DataTypes } = Sequelize;

const Companies = db.define(
  "companies",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    company_name: {
      type: DataTypes.STRING,
    },
    company_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Companies;
