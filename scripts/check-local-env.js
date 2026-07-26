import fs from 'node:fs';
import path from 'node:path';

const envPath = path.join(process.cwd(), '.env.local');

function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) {
    return new Set();
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return new Set(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => line.split('=', 1)[0].trim()),
  );
}

const keys = parseEnvKeys(envPath);

if (!keys.has('DATABASE_URL')) {
  console.error('Local preview is missing DATABASE_URL in .env.local.');
  console.error('Add your Neon local/development Postgres connection string as:');
  console.error('DATABASE_URL=postgres://user:password@host/dbname?sslmode=require');
  console.error('No production environment settings were changed.');
  process.exit(1);
}

console.log('Local preview environment ready: DATABASE_URL is configured.');
