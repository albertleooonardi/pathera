import fs from "fs";
import csv from "csv-parser";
import db from "../Database.js";
import Skills from "../model/Skills.js";

const skills = [];

fs.createReadStream("../dataset/skills.csv")
  .pipe(csv())
  .on("data", (data) => {
    skills.push({
      skill_name: data.skills,
    });
  })
  .on("end", async () => {
    try {
      await db.sync();

      const inserted = await Skills.bulkCreate(skills, {
        ignoreDuplicates: true,
      });

      console.log(
        `Skills data has been successfully seeded with ${inserted.length} entries.`
      );
    } catch (error) {
      console.error("Error seeding skills data:", error);
    }
  })
  .on("error", (error) => {
    console.error("Error processing the CSV file:", error);
  });
