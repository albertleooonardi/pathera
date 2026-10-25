import fs from "fs";
import csv from "csv-parser";
import db from "../Database.js";
import JobSkills from "../model/JobSkills.js";

const job_skills = [];

fs.createReadStream("../dataset/job_skills.csv")
  .pipe(csv())
  .on("data", (data) => {
    job_skills.push({
      job_id: parseInt(data.job_id),
      skill_id: parseInt(data.skill_id),
    });
  })
  .on("end", async () => {
    try {
      await db.sync();

      const inserted = await JobSkills.bulkCreate(job_skills, {
        ignoreDuplicates: true,
      });

      console.log(
        `JobSkills data has been successfully seeded with ${inserted.length} entries.`
      );
    } catch (error) {
      console.error("Error seeding job_skills data:", error);
    }
  });
