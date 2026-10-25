import Questions from "../model/Questions.js";
import { readCSV, bulkInsert } from "./readCSV.js";

export const seedQuestions = async () => {
  const rows = await readCSV("questions.csv");
  if (!rows) return new Set();

  // Keep the CSV ids: answer_key.csv references them
  const questions = rows.map((data) => ({
    id: parseInt(data.id),
    question: data.Question,
    job_title: data.JobTitle,
    topic: data.Topic,
  }));

  await bulkInsert(Questions, questions);
  console.log(`questions: ${questions.length} rows`);
  return new Set(questions.map((question) => question.id));
};
