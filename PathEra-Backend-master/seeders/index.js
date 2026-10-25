import db from "../Database.js";
import { migrate } from "../migrate.js";
import { seedCompanies } from "./CompanySeeder.js";
import { seedSkills } from "./SkillSeeder.js";
import { seedJobs } from "./JobSeeder.js";
import { seedJobSkills } from "./JobSkillsSeeder.js";
import { seedQuestions } from "./QuestionSeeder.js";
import { seedAnswerKey } from "./AnswerKeySeeder.js";

// Seeds in foreign-key order. Safe to re-run: existing rows are skipped.
const seed = async () => {
  await migrate();

  const companyIds = await seedCompanies();
  const skillIds = await seedSkills();
  const jobIds = await seedJobs(companyIds);
  await seedJobSkills(jobIds, skillIds);
  const questionIds = await seedQuestions();
  await seedAnswerKey(questionIds);

  // Explicit ids were inserted, so move the serial sequences past them
  for (const table of ["skills", "questions", "answer_key"]) {
    await db.query(
      `select setval(pg_get_serial_sequence('${table}', 'id'), coalesce(max(id), 0) + 1, false) from ${table}`
    );
  }
};

seed()
  .then(() => console.log("Seeding complete."))
  .catch((error) => {
    console.error("Error during data seeding:", error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
