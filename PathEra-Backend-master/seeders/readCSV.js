import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const datasetDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dataset"
);

// Resolves to null when the CSV is missing so the seeder can skip it
export const readCSV = (fileName) => {
  const filePath = path.join(datasetDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${fileName}: not found in ${datasetDir}`);
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
};

// Inserts in chunks, skipping rows whose primary key already exists
export const bulkInsert = async (Model, rows, chunkSize = 1000) => {
  for (let i = 0; i < rows.length; i += chunkSize) {
    await Model.bulkCreate(rows.slice(i, i + chunkSize), {
      ignoreDuplicates: true,
    });
  }
  return rows.length;
};
