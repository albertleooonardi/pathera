import Skills from "../model/Skills.js";
import { readCSV, bulkInsert } from "./readCSV.js";

export const seedSkills = async () => {
  const rows = await readCSV("skills.csv");
  if (!rows) return new Set();

  // Keep the CSV ids: job_skills.csv references them
  const skills = rows.map((data) => ({
    id: parseInt(data.id),
    skill_name: data.skills,
  }));

  await bulkInsert(Skills, skills);
  console.log(`skills: ${skills.length} rows`);
  return new Set(skills.map((skill) => skill.id));
};
