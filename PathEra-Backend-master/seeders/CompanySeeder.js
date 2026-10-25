import fs from "fs";
import csv from "csv-parser";
import db from "../Database.js";
import Companies from "../model/Companies.js";

const readCSVFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.id) {
          data.id = parseInt(data.id);
          data.company_image = data.company_image || null;
          results.push(data);
        } else {
          console.log("Skipping row due to missing id:", data);
        }
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => reject(err));
  });
};

const seedData = async () => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    const companies = await readCSVFile("../dataset/companies.csv");
    await Companies.bulkCreate(companies, {
      validate: true,
      ignoreDuplicates: true,
    });
    console.log("Data has been inserted successfully.");
  } catch (error) {
    console.error("Error during data seeding:", error);
  }
};

seedData();
