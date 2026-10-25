import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./Database.js";

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "supabase",
  "migrations"
);

// Applies supabase/migrations/*.sql in filename order, once each.
// Applied files are recorded in schema_migrations so new files can be added later.
export const migrate = async () => {
  await db.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
    alter table schema_migrations enable row level security;
  `);

  const [rows] = await db.query("select name from schema_migrations");
  const applied = new Set(rows.map((row) => row.name));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await db.transaction(async (transaction) => {
      await db.query(sql, { transaction });
      await db.query("insert into schema_migrations (name) values (:file)", {
        replacements: { file },
        transaction,
      });
    });
    console.log(`Applied migration ${file}`);
  }
};

// Allow `node migrate.js` / `npm run migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => console.log("Migrations complete."))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exitCode = 1;
    })
    .finally(() => db.close());
}
