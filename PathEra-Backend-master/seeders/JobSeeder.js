import Jobs from "../model/Jobs.js";
import { readCSV, bulkInsert } from "./readCSV.js";

export const seedJobs = async (companyIds) => {
  const rows = await readCSV("job_for_migration.csv");
  if (!rows) return new Set();

  const jobs = [];
  for (const data of rows) {
    const companyId = parseInt(data.company_id);
    if (!companyIds.has(companyId)) {
      console.warn(`Skipping job ${data.job_id}: unknown company_id ${data.company_id}`);
      continue;
    }

    jobs.push({
      id: parseInt(data.job_id),
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
      company_id: companyId,
    });
  }

  await bulkInsert(Jobs, jobs);
  console.log(`jobs: ${jobs.length} rows`);
  return new Set(jobs.map((job) => job.id));
};
