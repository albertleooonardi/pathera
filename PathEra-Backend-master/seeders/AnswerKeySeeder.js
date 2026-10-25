import fs from "fs";
import csv from "csv-parser";
import db from "../Database.js";
import AnswerKey from "../model/AnswerKey.js";

const answer_key = [];

fs.createReadStream("../dataset/answer_key.csv")
  .pipe(csv())
  .on("data", (data) => {
    answer_key.push({
      question_id: data.question_id,
      answer: data.Answer,
    });
  })
  .on("end", async () => {
    try {
      await db.sync();

      const inserted = await AnswerKey.bulkCreate(answer_key, {
        ignoreDuplicates: true,
      });

      console.log(
        `answer_key data has been successfully seeded with ${inserted.length} entries.`
      );
    } catch (error) {
      console.error("Error seeding job_skills data:", error);
    }
  });
