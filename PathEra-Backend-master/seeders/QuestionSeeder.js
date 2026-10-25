import fs from "fs";
import csv from "csv-parser";
import db from "../Database.js";
import Questions from "../model/Questions.js";

const questions = [];

fs.createReadStream("../dataset/questions.csv")
  .pipe(csv())
  .on("data", (data) => {
    questions.push({
      question: data.Question,
      job_title: data.JobTitle,
      topic: data.Topic,
    });
  })
  .on("end", async () => {
    try {
      await db.sync();

      const inserted = await Questions.bulkCreate(questions, {
        ignoreDuplicates: true,
      });

      console.log(
        `Questions data has been successfully seeded with ${inserted.length} entries.`
      );
    } catch (error) {
      console.error("Error seeding job_skills data:", error);
    }
  });
