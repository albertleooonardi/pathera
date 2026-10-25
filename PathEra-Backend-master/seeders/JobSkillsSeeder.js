import JobSkills from "../model/JobSkills.js";
import { readCSV, bulkInsert } from "./readCSV.js";

export const seedJobSkills = async (jobIds, skillIds) => {
  const rows = await readCSV("job_skills.csv");
  if (!rows) return;

  const jobSkills = rows
    .map((data) => ({
      job_id: parseInt(data.job_id),
      skill_id: parseInt(data.skill_id),
    }))
    .filter((row) => jobIds.has(row.job_id) && skillIds.has(row.skill_id));

  await bulkInsert(JobSkills, jobSkills);
  console.log(`job_skills: ${jobSkills.length} rows`);
};
