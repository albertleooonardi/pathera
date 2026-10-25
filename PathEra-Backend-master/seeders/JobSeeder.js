import fs from "fs";
import csv from "csv-parser";
import db from "../Database.js";
import Jobs from "../model/Jobs.js";

const results = [];

fs.createReadStream("../dataset/job_for_migration.csv")
  .pipe(csv())
  .on("data", (data) => {
    if (results.length < 50) {
      results.push({
        id: data.job_id,
        job_title: data.job_title,
        job_type: data.job_type,
        job_level: data.job_level,
        job_model: data.work_model,
        location: data.location,
        job_industry: null,
        min_experience: parseInt(data.min_experience) || 0,
        degree: data.degree || "Not Specified",
        job_description: data.about,
        job_link: "",
        date_posted: null,
        company_id: parseInt(data.company_id),
      });
    }
  })
  .on("end", async () => {
    try {
      await db.sync();

      const inserted = await Jobs.bulkCreate(results);

      console.log(
        `Data has been successfully seeded with ${inserted.length} entries.`
      );
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  })
  .on("error", (error) => {
    console.error("Error processing the CSV file:", error);
  });

process.on("exit", () => {
  db.close();
});
