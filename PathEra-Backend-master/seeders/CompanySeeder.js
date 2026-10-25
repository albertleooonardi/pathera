import Companies from "../model/Companies.js";
import { readCSV, bulkInsert } from "./readCSV.js";

export const seedCompanies = async () => {
  const rows = await readCSV("companies.csv");
  if (!rows) return new Set();

  const companies = rows
    .filter((data) => data.id)
    .map((data) => ({
      id: parseInt(data.id),
      company_name: data.company_name,
      company_image: data.company_image || null,
    }));

  await bulkInsert(Companies, companies);
  console.log(`companies: ${companies.length} rows`);
  return new Set(companies.map((company) => company.id));
};
