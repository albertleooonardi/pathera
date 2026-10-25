import AnswerKey from "../model/AnswerKey.js";
import { readCSV, bulkInsert } from "./readCSV.js";

export const seedAnswerKey = async (questionIds) => {
  const rows = await readCSV("answer_key.csv");
  if (!rows) return;

  // The CSV has no id column; use the row number so re-seeding doesn't duplicate
  const answerKey = rows
    .map((data, index) => ({
      id: index + 1,
      question_id: parseInt(data.question_id),
      answer: data.Answer,
    }))
    .filter((row) => questionIds.has(row.question_id));

  await bulkInsert(AnswerKey, answerKey);
  console.log(`answer_key: ${answerKey.length} rows`);
};
